const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const session = require("express-session");
const friendsRouter = require("./routes/friendsRoutes");
const blocksRouter = require("./routes/blocksRouter");




dotenv.config();
const app = express();
app.use(express.json()); // <--- PARSEO DE JSON
const PORT = process.env.PORT || 3000;

const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? "https://meetsync106.onrender.com"
  : "http://localhost:5173";

// -------------------- CORS --------------------
app.use(cors({
  origin: FRONTEND_URL, // tu frontend
  credentials: true,    // ⚡ muy importante para enviar cookies
}));

// -------------------- SESIÓN --------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecreto",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 🔹 si estás en dev, debe ser false
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  }


}));


app.post("/api/session", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "Falta userId" });

  req.session.user = { id: userId };

  // ✅ devuelve si el usuario ya hizo login de Google
  res.json({ success: true, hasGoogleToken: !!req.session.tokens });
});


// -------------------- OAuth Google --------------------
const redirectUri = process.env.NODE_ENV === "production"
  ? `${process.env.BACKEND_URL}/auth/google/callback`
  : `http://localhost:${PORT}/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

// -------------------- RUTAS --------------------

// Bloques
app.use("/api/blocks", blocksRouter);

// Amigos
app.use('/api/friends', friendsRouter);

// URL de login
app.get("/auth/google/url", (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // fuerza refresh_token
      scope: ["https://www.googleapis.com/auth/calendar.events"],
    });
    res.json({ url });
  } catch (err) {
    console.error("Error generando URL de Google:", err);
    res.status(500).json({ success: false, message: "No se pudo generar la URL de Google" });
  }
});

// Callback de Google
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Guardar tokens en sesión
    req.session.tokens = tokens;

    // Setear credenciales actuales
    oauth2Client.setCredentials(tokens);

    console.log("TOKENS:", tokens); // para debug

    res.redirect(`${FRONTEND_URL}/?success=true`);
  } catch (err) {
    console.error("Error en callback de Google:", err);
    res.status(500).send("Error autenticando con Google");
  }
});

// Middleware para asegurarse de que haya tokens
function requireAuth(req, res, next) {
  console.log("Tokens en sesión:", req.session.tokens);
  if (!req.session.tokens) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado con Google" });
  }
  oauth2Client.setCredentials(req.session.tokens);
  next();
}


// Crear evento
app.post("/api/calendar", requireAuth, async (req, res) => {
  try {
    const { day, start, finish, summary } = req.body;
    if (!day || !start || !finish || !summary)
      return res.status(400).json({ success: false, message: "Faltan datos" });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event = {
      summary,
      start: { dateTime: `${day}T${start}:00`, timeZone: "America/Argentina/Buenos_Aires" },
      end: { dateTime: `${day}T${finish}:00`, timeZone: "America/Argentina/Buenos_Aires" },
    };

    const response = await calendar.events.insert({ calendarId: "primary", requestBody: event });
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Error creando evento:", err);
    res.status(500).json({ success: false, message: "Error creando evento" });
  }
});

// Obtener eventos (incluye pasados y futuros)
app.get("/api/calendar/events", requireAuth, async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date("2000-01-01T00:00:00").toISOString(), // desde el año 2000
      timeMax: new Date("2100-01-01T00:00:00").toISOString(), // hasta muy adelante
      maxResults: 2500,
      singleEvents: true, // expande eventos recurrentes
      orderBy: "startTime",
      showDeleted: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    console.log("Eventos obtenidos:", response.data.items?.length || 0);
    res.json({ success: true, events: response.data.items || [] });

  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ success: false, message: "Error obteniendo eventos" });
  }
});



// Editar evento
app.put("/api/calendar/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, start, finish, summary } = req.body;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: id,
      requestBody: {
        summary,
        start: { dateTime: `${day}T${start}:00`, timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: `${day}T${finish}:00`, timeZone: "America/Argentina/Buenos_Aires" },
      },
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Error actualizando evento:", err);
    res.status(500).json({ success: false, message: "Error actualizando evento" });
  }
});

// Borrar evento
app.delete("/api/calendar/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({ calendarId: "primary", eventId: id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando evento:", err);
    res.status(500).json({ success: false, message: "Error eliminando evento" });
  }
});

// Ruta de prueba
app.get("/", (req, res) => res.send("Backend funcionando correctamente"));

// -------------------- LISTEN --------------------
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
