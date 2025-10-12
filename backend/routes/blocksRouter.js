const express = require("express");
const router = express.Router();
const supabaseAdmin = require("../supabaseClientAdmin");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

// -------------------- MIDDLEWARE --------------------
function requireLogin(req, res, next) {
  if (!req.session?.user)
    return res.status(401).json({ success: false, message: "No autenticado" });
  next();
}

function requireGoogleAuth(req, res, next) {
  const client = getGoogleClient(req);
  if (!client)
    return res
      .status(401)
      .json({ success: false, message: "No autenticado con Google" });
  req.oauth2Client = client;
  next();
}

// -------------------- HELPERS GOOGLE --------------------
function getGoogleClient(req) {
  if (!req.session?.tokens) return null;
  const client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials(req.session.tokens);
  return client;
}

function formatDateTime(day, time) {
  if (!time.includes(":")) return `${day}T${time}:00`;
  const parts = time.split(":");
  if (parts.length === 2) return `${day}T${time}:00`;
  if (parts.length === 3) return `${day}T${time}`;
  return `${day}T${time}`;
}

// -------------------- BLOQUES --------------------

// Crear o editar bloque (upsert)
router.post("/upsert", requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { id, summary, title, day, start, finish, color, googleId } = req.body;

  try {
    const upsertData = { user_id: userId, summary, title, day, start, finish, color };
    let onConflictColumn;

    if (googleId) {
      upsertData.google_event_id = googleId;
      onConflictColumn = ["google_event_id"];
    } else if (id) {
      upsertData.id = id;
      onConflictColumn = ["id"];
    }

    let query = supabaseAdmin.from("blocks");
    let result;
    if (onConflictColumn) {
      result = await query.upsert([upsertData], { onConflict: onConflictColumn }).select().single();
    } else {
      result = await query.insert([upsertData]).select().single();
    }

    if (result.error) throw result.error;

    const block = result.data;

    // Google Calendar: intentar sincronizar desde backend si hay tokens (no fallar la petición por error de Google)
    try {
      const oauth2Client = getGoogleClient(req);
      if (oauth2Client) {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        if (googleId) {
          await calendar.events.update({
            calendarId: "primary",
            eventId: googleId,
            requestBody: {
              summary: block.summary,
              start: { dateTime: formatDateTime(block.day, block.start), timeZone: "America/Argentina/Buenos_Aires" },
              end: { dateTime: formatDateTime(block.day, block.finish), timeZone: "America/Argentina/Buenos_Aires" },
            },
          });
        } else {
          const gEvent = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
              summary: block.summary,
              start: { dateTime: formatDateTime(block.day, block.start), timeZone: "America/Argentina/Buenos_Aires" },
              end: { dateTime: formatDateTime(block.day, block.finish), timeZone: "America/Argentina/Buenos_Aires" },
            },
          });

          // Guardar google_event_id si se creó
          if (gEvent.data?.id) {
            await supabaseAdmin.from("blocks").update({ google_event_id: gEvent.data.id }).eq("id", block.id);
            block.google_event_id = gEvent.data.id;
          }
        }
      }
    } catch (gErr) {
      console.warn("Google sync (upsert) warning:", gErr?.message || gErr);
      // no abortamos la petición principal
    }

    res.json({ success: true, block });
  } catch (err) {
    console.error("Error en /upsert:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Editar bloque por ID
router.put("/:id", requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  const { summary, title, day, start, finish, color } = req.body;

  try {
    const { data: block, error } = await supabaseAdmin
      .from("blocks")
      .update({ summary, title, day, start, finish, color })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*, google_event_id")
      .single();
    if (error) throw error;

    // Intentar actualizar en Google si corresponde (non-fatal)
    try {
      const oauth2Client = getGoogleClient(req);
      if (oauth2Client && block.google_event_id) {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.update({
          calendarId: "primary",
          eventId: block.google_event_id,
          requestBody: {
            summary: block.summary,
            start: { dateTime: formatDateTime(block.day, block.start), timeZone: "America/Argentina/Buenos_Aires" },
            end: { dateTime: formatDateTime(block.day, block.finish), timeZone: "America/Argentina/Buenos_Aires" },
          },
        });
      }
    } catch (gErr) {
      console.warn("Google sync (PUT) warning:", gErr?.message || gErr);
    }

    res.json({ success: true, block });
  } catch (err) {
    console.error("Error al actualizar bloque:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Borrar bloque por ID
router.delete("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session?.user?.id;

  try {
    // obtener bloque (si no existe, tratamos como idempotente)
    const { data: block, error: selectErr } = await supabaseAdmin
      .from("blocks")
      .select("id, google_event_id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (selectErr) throw selectErr;

    // Si no existe la fila -> success idempotente
    if (!block) {
      return res.json({ success: true, message: "Resource already deleted" });
    }

    // eliminar fila en Supabase
    const { error: delErr } = await supabaseAdmin
      .from("blocks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (delErr) throw delErr;

    // Intentar eliminar evento en Google si estaba asociado (no fatal)
    try {
      const oauth2Client = getGoogleClient(req);
      if (oauth2Client && block.google_event_id) {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.delete({ calendarId: "primary", eventId: block.google_event_id });
      }
    } catch (gErr) {
      const msg = gErr?.message || String(gErr);
      console.warn("Warning deleting Google event (non-fatal):", msg);

      // Si Google indica not found, consider it success (we already deleted row)
      if (/not found|404|Not Found/i.test(msg)) {
        return res.json({ success: true, message: "Deleted local row; event not found in Google" });
      }

      // For other Google errors, respond ok but indicate google error (avoid 500)
      return res.status(200).json({ success: false, message: "Error eliminando evento en Google", details: msg });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error borrando bloque por id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Borrar por google_event_id (cuando no hay id local o se quiere borrar por googleId)
router.delete("/google/:googleId", requireLogin, async (req, res) => {
  const { googleId } = req.params;
  const userId = req.session?.user?.id;

  try {
    // buscar fila por google_event_id y user
    const { data: block, error: selectErr } = await supabaseAdmin
      .from("blocks")
      .select("id, google_event_id")
      .eq("google_event_id", googleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (selectErr) throw selectErr;

    // Si no hay fila en DB, intentamos al menos borrar el evento en Google (non-fatal) y devolvemos success
    if (!block) {
      try {
        const oauth2Client = getGoogleClient(req);
        if (oauth2Client) {
          const calendar = google.calendar({ version: "v3", auth: oauth2Client });
          await calendar.events.delete({ calendarId: "primary", eventId: googleId });
        }
      } catch (gErr) {
        const msg = gErr?.message || String(gErr);
        console.warn("Warning deleting Google event (no DB row):", msg);

        if (/not found|404|Not Found/i.test(msg)) {
          return res.json({ success: true, message: "Evento no encontrado en Google" });
        }

        return res.status(200).json({ success: false, message: "Error eliminando evento en Google", details: msg });
      }
      return res.json({ success: true, message: "Resource already deleted (no DB row)" });
    }

    // eliminar fila en Supabase
    const { error: delErr } = await supabaseAdmin
      .from("blocks")
      .delete()
      .eq("id", block.id)
      .eq("user_id", userId);

    if (delErr) throw delErr;

    // eliminar en Google si corresponde (no fatal)
    try {
      const oauth2Client = getGoogleClient(req);
      if (oauth2Client && block.google_event_id) {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.delete({ calendarId: "primary", eventId: block.google_event_id });
      }
    } catch (gErr) {
      const msg = gErr?.message || String(gErr);
      console.warn("Warning deleting Google event after removing DB row:", msg);

      if (/not found|404|Not Found/i.test(msg)) {
        return res.json({ success: true, message: "Deleted local row; event not found in Google" });
      }

      return res.status(200).json({ success: false, message: "Error eliminando evento en Google", details: msg });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error borrando bloque por googleId:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Listar bloques
router.get("/", requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  try {
    const { data: blocks, error } = await supabaseAdmin
      .from("blocks")
      .select("*")
      .eq("user_id", userId)
      .order("day", { ascending: true });
    if (error) throw error;
    res.json({ success: true, blocks });
  } catch (err) {
    console.error("Error trayendo bloques:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- GOOGLE CALENDAR --------------------

// Listar eventos Google
router.get("/calendar/events", requireGoogleAuth, async (req, res) => {
  const oauth2Client = req.oauth2Client;
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date("2000-01-01T00:00:00Z").toISOString(),
      timeMax: new Date("2100-01-01T00:00:00Z").toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    res.json({ success: true, events: response.data.items || [] });
  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Crear evento Google (si se usa desde frontend directo; backend upsert también crea event)
router.post("/calendar", requireGoogleAuth, async (req, res) => {
  const oauth2Client = req.oauth2Client;
  const { day, start, finish, summary } = req.body;
  if (!day || !start || !finish || !summary)
    return res.status(400).json({ success: false, message: "Faltan datos" });

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        start: { dateTime: formatDateTime(day, start), timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: formatDateTime(day, finish), timeZone: "America/Argentina/Buenos_Aires" },
      },
    });

    // Guardar en supabase también
    await supabaseAdmin.from("blocks").insert({
      user_id: req.session.user.id,
      summary,
      title: summary,
      day,
      start,
      finish,
      color: null,
      google_event_id: response.data.id,
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Error creando evento:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar evento Google directo (maneja errores sin 500)
router.delete("/calendar/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session?.user?.id;

  try {
    const oauth2Client = getGoogleClient(req);
    if (!oauth2Client) {
      // no token: borrar solo fila local si existiera
      if (userId) {
        await supabaseAdmin.from("blocks").delete().eq("google_event_id", id).eq("user_id", userId);
      }
      return res.json({ success: true, message: "No Google token — eliminado local si existía" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({ calendarId: "primary", eventId: id });

    // borrar fila local asociada si existe
    if (userId) {
      await supabaseAdmin.from("blocks").delete().eq("google_event_id", id).eq("user_id", userId);
    }

    return res.json({ success: true });
  } catch (err) {
    console.warn("Error deleting Google event:", err?.message || err);
    const msg = (err && err.message) ? String(err.message) : "";

    if (/not found|404|Not Found/i.test(msg) || err?.code === 404) {
      if (userId) {
        try {
          await supabaseAdmin.from("blocks").delete().eq("google_event_id", id).eq("user_id", userId);
        } catch (delErr) {
          console.warn("Error deleting local row after Google not-found:", delErr);
        }
      }
      return res.json({ success: true, message: "Evento no encontrado en Google, eliminado localmente" });
    }

    // no devolvemos 500 para evitar romper la UX; frontend mostrará warning y forzará refresh
    return res.status(200).json({ success: false, message: "Error eliminando evento", details: msg });
  }
});

// Sincronización Google → Supabase (upsert + limpieza)
router.post("/sync-google", requireLogin, async (req, res) => {
  const oauth2Client = getGoogleClient(req);
  if (!oauth2Client) return res.status(200).json({ success: false, message: "Sin Google" });

  try {
    const userId = req.session.user.id;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date("2000-01-01T00:00:00Z").toISOString(),
      timeMax: new Date("2100-01-01T00:00:00Z").toISOString(),
      singleEvents: true,
    });

    const googleEvents = data.items || [];
    const googleIds = googleEvents.map(ev => ev.id).filter(Boolean);

    for (const ev of googleEvents) {
      if (!ev.start?.dateTime) continue;
      const day = ev.start.dateTime.slice(0, 10);
      const start = ev.start.dateTime.slice(11, 16);
      const finish = ev.end.dateTime.slice(11, 16);

      await supabaseAdmin.from("blocks").upsert(
        {
          user_id: userId,
          summary: ev.summary,
          title: ev.summary,
          day,
          start,
          finish,
          color: null,
          google_event_id: ev.id,
        },
        { onConflict: ["google_event_id"] }
      );
    }

    // limpiar filas locales que ya no existen en Google
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("blocks")
      .select("id, google_event_id")
      .eq("user_id", userId)
      .not("google_event_id", "is", null);

    if (selectErr) throw selectErr;

    const toRemove = (existing || [])
      .map(b => b.google_event_id)
      .filter(id => id && !googleIds.includes(id));

    let removed = 0;
    if (toRemove.length > 0) {
      const { data: delData, error: delErr } = await supabaseAdmin
        .from("blocks")
        .delete()
        .in("google_event_id", toRemove)
        .eq("user_id", userId);

      if (delErr) throw delErr;
      removed = Array.isArray(delData) ? delData.length : toRemove.length;
    }

    res.json({ success: true, synced: googleEvents.length, removed });
  } catch (err) {
    console.error("Error sincronizando Google:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;