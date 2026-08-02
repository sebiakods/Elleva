import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/businessPlans.controller";
import { verifyToken } from "../middleware/auth";
import { entrepreneurOnly, expertOrAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

// ─── Validation ───────────────────────────────────────────────────────────────
const createPlanSchema = z.object({
  title: z.string().min(3).max(200),
});

const updatePlanSchema = z.object({
  title:            z.string().min(3).max(200).optional(),
  progress:         z.number().int().min(0).max(100).optional(),
  executiveSummary: z.record(z.unknown()).optional(),
  marketAnalysis:   z.record(z.unknown()).optional(),
  strategy:         z.record(z.unknown()).optional(),
  financialPlan:    z.record(z.unknown()).optional(),
});

const reviewSchema = z.object({
  score:  z.number().int().min(0).max(100),
  notes:  z.string().min(10).max(5000),
  status: z.enum(["APPROVED", "REJECTED"]),
});

// ─── Entrepreneur ─────────────────────────────────────────────────────────────
router.get   ("/",              verifyToken, entrepreneurOnly, ctrl.listMyPlans);
router.post  ("/",              verifyToken, entrepreneurOnly, validate(createPlanSchema), ctrl.createPlan);
router.get   ("/:id",          verifyToken, ctrl.getPlan);          // expert/admin can also view
router.patch ("/:id",          verifyToken, entrepreneurOnly, validate(updatePlanSchema), ctrl.updatePlan);
router.post  ("/:id/submit",   verifyToken, entrepreneurOnly, ctrl.submitPlan);
router.delete("/:id",          verifyToken, entrepreneurOnly, ctrl.deletePlan);

// ─── Expert / Admin: review queue ─────────────────────────────────────────────
router.get   ("/review/queue", verifyToken, expertOrAdmin, ctrl.listSubmittedPlans);
router.patch ("/:id/review",   verifyToken, expertOrAdmin, validate(reviewSchema), ctrl.reviewPlan);

export default router;