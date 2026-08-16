import { Request, Response } from "express";
import * as svc from "../services/applications.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import {
  AuthenticatedRequest,
  ApplicationStatus,
  ReviewStatus,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER - Sérialisation BigInt
// ─────────────────────────────────────────────────────────────────────────────
function serializeBigInt<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT
// ─────────────────────────────────────────────────────────────────────────────
export async function applyExpertApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const application = await svc.applyExpertApplication({
      fullName: req.body.fullName,
      email: req.body.email,
      title: req.body.title,
      experience: req.body.experience,
      specialties: req.body.specialties,
      languages: req.body.languages,
      linkedin: req.body.linkedin,
      portfolio: req.body.portfolio,
      certifications: req.body.certifications,
      motivation: req.body.motivation,
      cvPath: req.file?.path ?? null,
    });

    R.created(
      res,
      serializeBigInt(application),
      "Candidature experte envoyée avec succès"
    );
  } catch (err) {
    console.error("APPLY EXPERT APPLICATION ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTREPRENEUR - Apply to a financing program
// ─────────────────────────────────────────────────────────────────────────────

export async function applyToProgram(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { programId, amountRequested, coverLetter } = req.body as {
      programId: string;
      amountRequested: number;
      coverLetter?: string;
    };

    if (!req.user) {
      R.unauthorized(res);
      return;
    }

    const application = await svc.applyToProgram(
      req.user.id,
      programId,
      amountRequested,
      coverLetter
    );

    R.created(
      res,
      serializeBigInt(application),
      "Candidature soumise avec succès"
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PROGRAM_NOT_FOUND") {
        R.notFound(res, "Programme introuvable ou non publié");
        return;
      }

      if (err.message === "ALREADY_APPLIED") {
        R.conflict(res, "Vous avez déjà candidaté à ce programme");
        return;
      }
    }

    console.error("APPLY TO PROGRAM ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTREPRENEUR - List my applications
// ─────────────────────────────────────────────────────────────────────────────

export async function listMyApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      R.unauthorized(res);
      return;
    }

    const applications = await svc.listMyApplications(req.user.id);

    R.ok(res, serializeBigInt(applications));
  } catch (err) {
    console.error("LIST MY APPLICATIONS ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTREPRENEUR - Withdraw application
// ─────────────────────────────────────────────────────────────────────────────

export async function withdrawApplication(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      R.unauthorized(res);
      return;
    }

    await svc.withdrawApplication(String(req.params.id), req.user.id);

    R.noContent(res);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        R.notFound(res);
        return;
      }

      if (err.message === "FORBIDDEN") {
        R.forbidden(res);
        return;
      }

      if (err.message === "CANNOT_WITHDRAW") {
        R.badRequest(
          res,
          "Une candidature approuvée ne peut pas être retirée"
        );
        return;
      }
    }

    console.error("WITHDRAW APPLICATION ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTION - List applications
// ─────────────────────────────────────────────────────────────────────────────

export async function listInstitutionApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      R.unauthorized(res);
      return;
    }

    const { page, limit, skip } = getPagination(req);

    const { status, programId } = req.query as Record<
      string,
      string | undefined
    >;

    const { default: prisma } = await import("../config/database");

    const profile = await prisma.institutionProfile.findUnique({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      R.forbidden(res, "Profil institution introuvable");
      return;
    }

    const { applications, total } = await svc.listInstitutionApplications(
      profile.id,
      {
        skip,
        limit,
        status,
        programId,
      }
    );

    R.ok(
      res,
      serializeBigInt(
        paginate(applications, total, {
          page,
          limit,
          skip,
        })
      )
    );
  } catch (err) {
    console.error("LIST INSTITUTION APPLICATIONS ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTION - Update application status
// ─────────────────────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      R.unauthorized(res);
      return;
    }

    const { status, notes } = req.body as {
      status: ApplicationStatus;
      notes?: string;
    };

    const { default: prisma } = await import("../config/database");

    const profile = await prisma.institutionProfile.findUnique({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      R.forbidden(res, "Profil institution introuvable");
      return;
    }

    const application = await svc.updateApplicationStatus(
      String(req.params.id),
      profile.id,
      status,
      notes
    );

    R.ok(
      res,
      serializeBigInt(application),
      "Statut de la candidature mis à jour"
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        R.notFound(res);
        return;
      }

      if (err.message === "FORBIDDEN") {
        R.forbidden(res);
        return;
      }
    }

    console.error("UPDATE APPLICATION STATUS ERROR:", err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN - Get all expert applications
// ─────────────────────────────────────────────────────────────────────────────

export async function getApplications(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { default: prisma } = await import("../config/database");

    const applications = await prisma.expertApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      applications: serializeBigInt(applications),
    });
  } catch (error) {
    console.error("GET EXPERT APPLICATIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load expert applications",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN - Get one expert application
// ─────────────────────────────────────────────────────────────────────────────

export async function getApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { default: prisma } = await import("../config/database");

    const application = await prisma.expertApplication.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        message: "Application not found",
      });
      return;
    }

    res.json({
      success: true,
      application: serializeBigInt(application),
    });
  } catch (error) {
    console.error("GET EXPERT APPLICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN - Approve expert application
// ─────────────────────────────────────────────────────────────────────────────

export async function approveApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { default: prisma } = await import("../config/database");

    const application = await prisma.expertApplication.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: ReviewStatus.APPROVED,
      },
    });

    res.json({
      success: true,
      application: serializeBigInt(application),
    });
  } catch (error) {
    console.error("APPROVE EXPERT APPLICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Approve failed",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN - Reject expert application
// ─────────────────────────────────────────────────────────────────────────────

export async function rejectApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { default: prisma } = await import("../config/database");

    const application = await prisma.expertApplication.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        status: ReviewStatus.REJECTED,
      },
    });

    res.json({
      success: true,
      application: serializeBigInt(application),
    });
  } catch (error) {
    console.error("REJECT EXPERT APPLICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Reject failed",
    });
  }
}