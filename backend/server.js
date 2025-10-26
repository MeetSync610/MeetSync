const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const session = require("express-session");
const blocksRouter = require("./routes/blocksRouter");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";

// FRONTEND / BACKEND URLs
const FRONTEND_URL = process.env.FRONTEND_URL || (IS_PROD ? "https://meetsync106.onrender.com" : "http://localhost:5173");
const BACKEND_URL = process.env.BACKEND_URL || (IS_PROD ? `https://meetsync-9g91.onrender.com` : `http://localhost:${PORT}`);

// trust proxy when behind a proxy (Render, Heroku, etc.) so secure cookies work
if (IS_PROD) app.set("trust proxy", 1);

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow frontend origin and credentials
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecreto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PROD, 
      sameSite: IS_PROD ? "none" : "lax", 
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);


function makeOauthClient() {
  const redirectUri = IS_PROD
    ? `${BACKEND_URL.replace(/\/$/, "")}/auth/google/callback`
    : `http://localhost:${PORT}/auth/google/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

// -------------------- SESSION API --------------------
app.post("/api/session", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "Falta userId" });

  req.session.user = { id: userId };
  res.json({ success: true, hasGoogleToken: !!req.session.tokens });
});

// -------------------- AUTH (Google OAuth) --------------------
app.get("/auth/google/url", (req, res) => {
  try {
    const oauth2Client = makeOauthClient();
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

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  try {
    const oauth2Client = makeOauthClient();
    const { tokens } = await oauth2Client.getToken(code);
    // store tokens
    req.session.tokens = tokens;

  
    console.log("TOKENS saved in session (masked):", {
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      has_refresh_token: !!tokens.refresh_token,
    });

    res.redirect(`${FRONTEND_URL}/?success=true`);
  } catch (err) {
    console.error("Error en callback de Google:", err);
    res.status(500).send("Error autenticando con Google");
  }
});


function requireAuth(req, res, next) {
  if (!req.session?.tokens) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado con Google" });
  }
  req.oauth2Client = makeOauthClient();
  req.oauth2Client.setCredentials(req.session.tokens);
  next();
}

// -------------------- GOOGLE CALENDAR DIRECT ENDPOINTS --------------------
app.post("/api/calendar", requireAuth, async (req, res) => {
  try {
    const { day, start, finish, summary } = req.body;
    if (!day || !start || !finish || !summary)
      return res.status(400).json({ success: false, message: "Faltan datos" });

    const calendar = google.calendar({ version: "v3", auth: req.oauth2Client });
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

app.get("/api/calendar/events", requireAuth, async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: req.oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date("2000-01-01T00:00:00").toISOString(),
      timeMax: new Date("2100-01-01T00:00:00").toISOString(),
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
      showDeleted: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });
    res.json({ success: true, events: response.data.items || [] });
  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ success: false, message: "Error obteniendo eventos" });
  }
});

app.put("/api/calendar/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, start, finish, summary } = req.body;
    const calendar = google.calendar({ version: "v3", auth: req.oauth2Client });
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

app.delete("/api/calendar/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = google.calendar({ version: "v3", auth: req.oauth2Client });
    await calendar.events.delete({ calendarId: "primary", eventId: id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando evento:", err);
    res.status(500).json({ success: false, message: "Error eliminando evento" });
  }
});

// -------------------- API ROUTES --------------------
app.use("/api/blocks", blocksRouter);

// simple root
app.get("/", (req, res) => res.send("Backend funcionando correctamente"));

// -------------------- START --------------------
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT} (PORT env ${process.env.PORT || "<not set>"})`));