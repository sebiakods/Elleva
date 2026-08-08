import { Router } from "express";
import { Role } from "@prisma/client";

import * as programController from "../controllers/programs.controller";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

// ============================================================================
// INSTITUTION
// ============================================================================

router.get(
  "/institution/programs",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.listInstitutionPrograms
);

router.get(
  "/institution/programs/stats",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.getInstitutionStats
);

router.post(
  "/institution/programs",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.createProgram
);

router.get(
  "/institution/programs/:id",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.getInstitutionProgram
);

router.put(
  "/institution/programs/:id",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.updateProgram
);

router.delete(
  "/institution/programs/:id",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.deleteProgram
);

router.patch(
  "/institution/programs/:id/publish",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.publishProgram
);

router.patch(
  "/institution/programs/:id/archive",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.archiveProgram
);

router.get(
  "/institution/programs/:id/applications",
  authenticate,
  authorize(Role.INSTITUTION),
  programController.getInstitutionProgramApplications
);

// ============================================================================
// PUBLIC / ENTREPRENEUR
// ============================================================================

router.get(
  "/programs",
  programController.listPrograms
);

router.get(
  "/programs/:id",
  programController.getProgram
);

router.post(
  "/programs/:id/apply",
  authenticate,
  authorize(Role.ENTREPRENEUR),
  programController.applyToProgram
);

router.post(
  "/programs/:id/favorite",
  authenticate,
  authorize(Role.ENTREPRENEUR),
  programController.favoriteProgram
);

router.delete(
  "/programs/:id/favorite",
  authenticate,
  authorize(Role.ENTREPRENEUR),
  programController.unfavoriteProgram
);

router.get(
  "/my/applications",
  authenticate,
  authorize(Role.ENTREPRENEUR),
  programController.listMyApplications
);

// ============================================================================
// EXPERT
// ============================================================================

router.get(
  "/expert/programs",
  authenticate,
  authorize(Role.EXPERT),
  programController.listExpertPrograms
);

router.get(
  "/expert/programs/:id",
  authenticate,
  authorize(Role.EXPERT),
  programController.getExpertProgram
);

// ============================================================================
// ADMIN
// ============================================================================

// IMPORTANT:
// This endpoint returns ALL programs:
// - published
// - unpublished
// - archived
// - drafts
// - programs created by institutions

router.get(
  "/admin/programs",
  authenticate,
  authorize(Role.ADMIN),
  programController.listAllPrograms
);

router.get(
  "/admin/programs/:id",
  authenticate,
  authorize(Role.ADMIN),
  programController.getAnyProgram
);

router.put(
  "/admin/programs/:id",
  authenticate,
  authorize(Role.ADMIN),
  programController.adminUpdateProgram
);

router.delete(
  "/admin/programs/:id",
  authenticate,
  authorize(Role.ADMIN),
  programController.adminDeleteProgram
);

router.patch(
  "/admin/programs/:id/publish",
  authenticate,
  authorize(Role.ADMIN),
  programController.adminPublishProgram
);

router.patch(
  "/admin/programs/:id/archive",
  authenticate,
  authorize(Role.ADMIN),
  programController.adminArchiveProgram
);

export default router;