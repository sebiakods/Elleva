import { Router } from "express";
import * as institutionController from "../controllers/institutionApplications.controller";
import upload from "../middleware/upload";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";

const router = Router();

// Public: submit an institution application
router.post("/", upload.single("document"), institutionController.createApplication);

// Admin only
router.get("/", authenticate, requireRoles("ADMIN"), institutionController.getApplications);
router.get("/:id", authenticate, requireRoles("ADMIN"), institutionController.getApplication);
router.patch("/:id/approve", authenticate, requireRoles("ADMIN"), institutionController.approveApplication);
router.patch("/:id/reject", authenticate, requireRoles("ADMIN"), institutionController.rejectApplication);
router.delete("/:id", authenticate, requireRoles("ADMIN"), institutionController.deleteApplication);

export default router;