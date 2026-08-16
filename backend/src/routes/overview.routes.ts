import { Router } from "express";
import { Role } from "@prisma/client";
import * as overviewController from "../controllers/overview.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/institution/overview",
  authenticate,
  authorize(Role.INSTITUTION),
  overviewController.getInstitutionOverview
);

router.get(
  "/admin/overview",
  authenticate,
  authorize(Role.ADMIN),
  overviewController.getAdminOverview
);
export default router;