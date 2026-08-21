import { Router } from "express";
import { z } from "zod";
import { Role } from "../types";
import * as ctrl from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { verifyToken } from "../middleware/auth";

console.log("✅ auth.routes.ts loaded");

const router = Router();

// ─────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Email invalide"),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),

  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),

  role: z.nativeEnum(Role, {
    errorMap: () => ({
      message: `Le rôle doit être : ${Object.values(Role).join(", ")}`,
    }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const refreshSchema = z.object({});
// ─────────────────────────────────────────────────────────────
// Debug middleware
// ─────────────────────────────────────────────────────────────

router.use((req, _res, next) => {
  console.log(`[AUTH] ${req.method} ${req.originalUrl}`);
  next();
});

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────
router.post(
  "/register",
  validate(registerSchema),
  ctrl.register
);

router.post(
  "/login",
  validate(loginSchema),
  ctrl.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  ctrl.refresh
);

router.post(
  "/logout",
  verifyToken,
  ctrl.logout
);

router.get(
  "/me",
  verifyToken,
  ctrl.me
);
export default router;