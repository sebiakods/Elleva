import { Router, Response, NextFunction } from "express";
import { z } from "zod";

import * as ctrl from "../controllers/programs.controller";
import { verifyToken, optionalToken } from "../middleware/auth";
import { institutionOrAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/database";
import * as R from "../utils/response";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

const createProgramSchema = z.object({
  slug: z.string().min(3),

  title: z.string().min(5),
  shortDescription: z.string().optional(),
  description: z.string().min(20),

  category: z.enum([
    "BANK_LOAN",
    "ISLAMIC_FINANCE",
    "GOVERNMENT_GRANT",
    "STARTUP_FUNDING",
  ]),

  sector: z.string().optional(),
  fundingType: z.string().optional(),

  amountMin: z.number().nullable().optional(),
  amountMax: z.number().nullable().optional(),

  currency: z.string().default("DZD"),

  openingDate: z.string().optional(),
  closingDate: z.string().optional(),

  region: z.string().optional(),

  targetAudience: z.string().optional(),

  eligibility: z.array(z.string()).default([]),

  requiredDocuments: z.array(z.string()).default([]),

  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),

  status: z.enum(["draft", "published"]),
});

const updateProgramSchema = createProgramSchema.partial();

/* -------------------------------------------------------------------------- */
/*                        Attach Institution Profile ID                        */
/* -------------------------------------------------------------------------- */

async function attachInstitutionProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await prisma.institutionProfile.findUnique({
      where: {
        userId: req.user!.id,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      R.forbidden(res, "Profil institution introuvable");
      return;
    }

    req.body._institutionProfileId = profile.id;

    next();
  } catch (error) {
    console.error(error);
    R.serverError(res);
    return;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Public                                   */
/* -------------------------------------------------------------------------- */

router.get("/", optionalToken, ctrl.listPrograms);

router.get("/favorites", verifyToken, ctrl.getFavorites);

router.post("/:programId/favorite", verifyToken, ctrl.toggleFavorite);

/* -------------------------------------------------------------------------- */
/*                             Institution CRUD                               */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  verifyToken,
  institutionOrAdmin,
  validate(createProgramSchema),
  attachInstitutionProfile,
  ctrl.createProgram
);

router.patch(
  "/:id",
  verifyToken,
  institutionOrAdmin,
  validate(updateProgramSchema),
  attachInstitutionProfile,
  ctrl.updateProgram
);

router.delete(
  "/:id",
  verifyToken,
  institutionOrAdmin,
  attachInstitutionProfile,
  ctrl.deleteProgram
);

/* -------------------------------------------------------------------------- */
/*                               Public Single                                */
/* -------------------------------------------------------------------------- */

router.get("/:slug", optionalToken, ctrl.getProgram);

export default router;