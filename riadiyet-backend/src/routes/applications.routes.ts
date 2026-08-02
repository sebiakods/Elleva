import { Router } from "express";
import { z } from "zod";

import * as ctrl from "../controllers/applications.controller";
import { verifyToken } from "../middleware/auth";
import { entrepreneurOnly, institutionOrAdmin } from "../middleware/rbac";
import upload from "../middleware/upload";
import { validate } from "../middleware/validate";

const router = Router();

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const applySchema = z.object({
  programId: z.string().cuid("ID de programme invalide"),
  amountRequested: z.number().int().positive("Le montant doit être positif"),
  coverLetter: z.string().max(3000).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "WAITLISTED",
  ]),
  notes: z.string().max(2000).optional(),
});

// ─────────────────────────────────────────────────────────────
// Expert application (public)
// ─────────────────────────────────────────────────────────────

router.post(
  "/expert",
  upload.single("cv"),
  ctrl.applyExpertApplication
);

// ─────────────────────────────────────────────────────────────
// Entrepreneur
// ─────────────────────────────────────────────────────────────

router.get(
  "/my",
  verifyToken,
  entrepreneurOnly,
  ctrl.listMyApplications
);

router.post(
  "/",
  verifyToken,
  entrepreneurOnly,
  validate(applySchema),
  ctrl.applyToProgram
);

router.delete(
  "/:id",
  verifyToken,
  entrepreneurOnly,
  ctrl.withdrawApplication
);

// ─────────────────────────────────────────────────────────────
// Institution / Admin
// ─────────────────────────────────────────────────────────────

router.get(
  "/",
  verifyToken,
  institutionOrAdmin,
  ctrl.listInstitutionApplications
);

router.patch(
  "/:id/status",
  verifyToken,
  institutionOrAdmin,
  validate(updateStatusSchema),
  ctrl.updateApplicationStatus
);

export default router;