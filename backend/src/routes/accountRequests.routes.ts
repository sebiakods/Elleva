// backend/src/routes/accountRequests.routes.ts
import { Router } from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  deleteRequest,
} from "../controllers/accountRequests.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";

const router = Router();

// Public: expert/institution submits their signup request
router.post("/", createRequest);

// Admin only from here on
router.get("/", authenticate, requireRoles("ADMIN"), getRequests);
router.get("/:id", authenticate, requireRoles("ADMIN"), getRequestById);
router.patch("/:id/approve", authenticate, requireRoles("ADMIN"), approveRequest);
router.patch("/:id/reject", authenticate, requireRoles("ADMIN"), rejectRequest);
router.delete("/:id", authenticate, requireRoles("ADMIN"), deleteRequest);

export default router;