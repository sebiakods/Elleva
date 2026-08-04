import { Router } from "express";
import * as institutionController from "../controllers/institutionApplications.controller";
import upload from "../middleware/upload";

const router = Router();

// Submit an institution application
router.post(
  "/",
  upload.single("document"),
  institutionController.createApplication
);

// Get all applications
router.get("/", institutionController.getApplications);

// Get one application
router.get("/:id", institutionController.getApplication);

// Approve
router.patch("/:id/approve", institutionController.approveApplication);

// Reject
router.patch("/:id/reject", institutionController.rejectApplication);

export default router;