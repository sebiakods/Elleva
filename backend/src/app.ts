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

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
    ],
  })
);

// ─── Rate limiting ───────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Trop de requêtes, réessayez dans 1 minute",
  },
});

app.use(limiter);

// ─── Auth rate limiting ──────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === "development" ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Trop de tentatives, réessayez dans 1 minute",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Body parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────────────

if (env.NODE_ENV !== "test") {
  app.use(
    morgan(
      env.NODE_ENV === "development"
        ? "dev"
        : "combined"
    )
  );
}

// ─── API routes ──────────────────────────────────────────────────────────────

app.use("/api", routes);

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route introuvable",
  });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Ellevadz API — ${env.NODE_ENV.padEnd(34)}║
╠══════════════════════════════════════════════════════════════╣
║  🚀  http://localhost:${env.PORT}                            ║
║  📖  Health: http://localhost:${env.PORT}/api/health         ║
║  🔐  Auth:   http://localhost:${env.PORT}/api/auth           ║
╚══════════════════════════════════════════════════════════════╝
  `);
});