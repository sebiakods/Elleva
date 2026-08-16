import { Router } from "express";
import { Role } from "@prisma/client";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/institution/analytics",
  authenticate,
  authorize(Role.INSTITUTION),
  analyticsController.getInstitutionAnalytics
);

export default router;