// backend/src/routes/institutionProfile.routes.ts
import { Router } from "express";
import { institutionProfileController } from "../controllers/institutionProfile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";
import { uploadImage } from "../middleware/upload";

const router = Router();

router.get("/me", authenticate, requireRoles("INSTITUTION"), institutionProfileController.getMe);
router.patch(
  "/me",
  authenticate,
  requireRoles("INSTITUTION"),
  uploadImage.single("logo"),
  institutionProfileController.updateMe
);

export default router;