import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes/index";
import path from "path";

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
// helmet's default Cross-Origin-Resource-Policy is "same-origin", which blocks
// the frontend (localhost:3000) from embedding files served from this API
// (localhost:4000) in <video>/<img> tags, even though the request itself
// succeeds (you'd see it as a 200/206 in the server logs but nothing renders
// in the browser). We keep helmet's defaults everywhere else and only relax
// this for the /uploads static route below.
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "user-id",
    ],
  })
);
// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Trop de requêtes, réessayez dans 15 minutes" },
});
app.use(limiter);

// ─── Auth routes get a stricter limiter ───────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "development" ? 500 : 20,
  message: { success: false, error: "Trop de tentatives, réessayez dans 15 minutes" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}


//----
// Uploaded files (course videos, images, PDFs, etc.) need to be embeddable
// cross-origin by the frontend (different port = different origin in dev,
// and possibly a different subdomain in prod). Override helmet's default
// same-origin CORP just for this route so <video>/<img>/<a download> all work
// when loaded from the frontend origin.
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route introuvable" });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Ellevadz API — ${env.NODE_ENV.padEnd(34)}║
╠══════════════════════════════════════════════════════════════╣
║  🚀  http://localhost:${env.PORT}                                  ║
║  📖  Health: http://localhost:${env.PORT}/api/health              ║
║  🔐  Auth:   http://localhost:${env.PORT}/api/auth                ║
╚══════════════════════════════════════════════════════════════╝
  `);
});