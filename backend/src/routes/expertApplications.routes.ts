import { Router } from "express";
import * as expertController from "../controllers/expertApplications.controller";
import upload from "../middleware/upload";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";

const router = Router();

// Public: submit an expert application (CV upload)
router.post("/", upload.single("cv"), expertController.createApplication);

// Admin only
router.get("/", authenticate, requireRoles("ADMIN"), expertController.getApplications);
router.get("/:id", authenticate, requireRoles("ADMIN"), expertController.getApplication);
router.patch("/:id/approve", authenticate, requireRoles("ADMIN"), expertController.approveApplication);
router.patch("/:id/reject", authenticate, requireRoles("ADMIN"), expertController.rejectApplication);
router.delete("/:id", authenticate, requireRoles("ADMIN"), expertController.deleteApplication);

export default router;