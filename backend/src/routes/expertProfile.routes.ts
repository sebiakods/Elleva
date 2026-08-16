// backend/src/routes/expertProfile.routes.ts
import { Router } from "express";
import { expertProfileController } from "../controllers/expertProfile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";
import { uploadImage } from "../middleware/upload"; // from the institution profile setup

const router = Router();

router.get("/me", authenticate, requireRoles("EXPERT"), expertProfileController.getMe);
router.patch(
  "/me",
  authenticate,
  requireRoles("EXPERT"),
  uploadImage.single("avatar"),
  expertProfileController.updateMe
);

export default router;