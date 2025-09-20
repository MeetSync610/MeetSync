import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import session from "express-session";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- CORS --------------------
const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? "https://meetsync106.onrender.com"
  : "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// -------------------- SESIÓN --------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecreto",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" },
}));

// -------------------- OAUTH GOOGLE --------------------
const redirectUri = process.env.NODE_ENV === "production"
  ? `${process.env.BACKEND_URL}/auth/google/callback`
  : `http://localhost:${PORT}/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

// Si tenemos refresh_token en env, lo seteamos
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

// -------------------- RUTAS --------------------

// URL de login
app.get("/auth/google/url", (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
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

    console.log("TOKENS:", tokens);

    res.redirect(`${FRONTEND_URL}/?success=true`);
  } catch (err) {
    console.error("Error en callback de Google:", err);
    res.status(500).send("Error autenticando con Google");
  }
});

// -------------------- MIDDLEWARE --------------------
// Refresca access_token automáticamente
async function ensureAuth(req, res, next) {
  try {
    // Si hay tokens en sesión, úsalos
    if (req.session.tokens) {
      oauth2Client.setCredentials(req.session.tokens);
    }

    // Si hay refresh_token en env, generá access_token
    const tokenResponse = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: tokenResponse.token });

    next();
  } catch (err) {
    console.error("Error refrescando token:", err);
    res.status(401).json({ success: false, message: "No autenticado con Google" });
  }
}

// -------------------- RUTAS DE CALENDAR --------------------

// Crear evento
app.post("/api/calendar", ensureAuth, async (req, res) => {
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

// Obtener eventos
app.get("/api/calendar/events", ensureAuth, async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
      timeZone: "America/Argentina/Buenos_Aires",
    });
    res.json({ success: true, events: response.data.items });
  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ success: false, message: "Error obteniendo eventos" });
  }
});

// Editar evento
app.put("/api/calendar/:id", ensureAuth, async (req, res) => {
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
app.delete("/api/calendar/:id", ensureAuth, async (req, res) => {
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

// -------------------- TEST --------------------
app.get("/", (req, res) => res.send("Backend funcionando correctamente"));

// -------------------- LISTEN --------------------
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
