import { Router } from "express";
import * as expertController from "../controllers/expertApplications.controller";

const router = Router();

// Submit an expert application
router.post("/", expertController.createApplication);

// Get all applications (Admin)
router.get("/", expertController.getApplications);

// Get one application
router.get("/:id", expertController.getApplication);

// Approve
router.patch("/:id/approve", expertController.approveApplication);

// Reject
router.patch("/:id/reject", expertController.rejectApplication);

// Delete
router.delete("/:id", expertController.deleteApplication);

export default router;