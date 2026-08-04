import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/users.controller";
import { verifyToken } from "../middleware/auth";
import { adminOnly } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  language: z.enum(["AR", "FR", "EN"]).optional(),
});

// ─────────────────────────────────────────────
// Own profile
// ─────────────────────────────────────────────
router.get(
  "/me",
  verifyToken,
  ctrl.getMe
);

router.patch(
  "/me",
  verifyToken,
  validate(updateProfileSchema),
  ctrl.updateMe
);

// ─────────────────────────────────────────────
// Admin: user management
// ─────────────────────────────────────────────

// List users
router.get(
  "/",
  verifyToken,
  adminOnly,
  ctrl.listUsers
);

// View one user
router.get(
  "/:id",
  verifyToken,
  adminOnly,
  ctrl.getUserById
);

// Suspend user
router.patch(
  "/:id/suspend",
  verifyToken,
  adminOnly,
  ctrl.suspendUser
);

// Activate user
router.patch(
  "/:id/activate",
  verifyToken,
  adminOnly,
  ctrl.activateUser
);

// Delete user
router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  ctrl.deleteUser
);

export default router;