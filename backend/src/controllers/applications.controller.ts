import { Request, Response } from "express";
import * as svc from "../services/applications.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest, ApplicationStatus } from "../types";
import upload from "../middleware/upload";

// ─── Expert ───────────────────────────────────────────────────────────────────
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
      application,
      "Candidature experte envoyée avec succès"
    );
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}
// ─── Entrepreneur ─────────────────────────────────────────────────────────────

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

    const application = await svc.applyToProgram(
      req.user!.id,
      programId,
      amountRequested,
      coverLetter
    );

    R.created(res, application, "Candidature soumise avec succès");
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PROGRAM_NOT_FOUND") {
        return void R.notFound(res, "Programme introuvable ou non publié");
      }

      if (err.message === "ALREADY_APPLIED") {
        return void R.conflict(
          res,
          "Vous avez déjà candidaté à ce programme"
        );
      }
    }

    R.serverError(res);
  }
}

export async function listMyApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const applications = await svc.listMyApplications(req.user!.id);
    R.ok(res, applications);
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function withdrawApplication(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    await svc.withdrawApplication(
      String(req.params.id),
      req.user!.id
    );

    R.noContent(res);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return void R.notFound(res);
      }

      if (err.message === "FORBIDDEN") {
        return void R.forbidden(res);
      }

      if (err.message === "CANNOT_WITHDRAW") {
        return void R.badRequest(
          res,
          "Une candidature approuvée ne peut pas être retirée"
        );
      }
    }

    R.serverError(res);
  }
}

// ─── Institution ──────────────────────────────────────────────────────────────

export async function listInstitutionApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const { status, programId } = req.query as Record<string, string>;

    const { default: prisma } = await import("../config/database");

    const profile = await prisma.institutionProfile.findUnique({
      where: {
        userId: req.user!.id,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      return void R.forbidden(
        res,
        "Profil institution introuvable"
      );
    }

    const { applications, total } =
      await svc.listInstitutionApplications(profile.id, {
        skip,
        limit,
        status,
        programId,
      });

    R.ok(
      res,
      paginate(applications, total, {
        page,
        limit,
        skip,
      })
    );
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function updateApplicationStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { status, notes } = req.body as {
      status: ApplicationStatus;
      notes?: string;
    };

    const { default: prisma } = await import("../config/database");

    const profile = await prisma.institutionProfile.findUnique({
      where: {
        userId: req.user!.id,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      return void R.forbidden(
        res,
        "Profil institution introuvable"
      );
    }

    const application = await svc.updateApplicationStatus(
      String(req.params.id),
      profile.id,
      status,
      notes
    );

    R.ok(
      res,
      application,
      "Statut de la candidature mis à jour"
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return void R.notFound(res);
      }

      if (err.message === "FORBIDDEN") {
        return void R.forbidden(res);
      }
    }

    R.serverError(res);
  }
}
// ─────────────────────────────────────────
// ADMIN - Get all expert applications
// ─────────────────────────────────────────

export async function getApplications(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { default: prisma } = await import(
      "../config/database"
    );


    const applications =
      await prisma.expertApplication.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });


    res.json({
      success: true,
      applications,
    });


  } catch (error) {

    console.error(
      "GET EXPERT APPLICATIONS ERROR:",
      error
    );


    res.status(500).json({
      success:false,
      message:"Failed to load expert applications",
    });

  }
}



// ─────────────────────────────────────────
// ADMIN - Get one expert application
// ─────────────────────────────────────────

export async function getApplication(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { default: prisma } = await import(
      "../config/database"
    );


    const application =
      await prisma.expertApplication.findUnique({
        where:{
          id:String(req.params.id),
        },
      });


    if(!application){

      res.status(404).json({
        success:false,
        message:"Application not found",
      });

      return;
    }


    res.json({
      success:true,
      application,
    });


  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server error",
    });

  }

}



// ─────────────────────────────────────────
// ADMIN - Approve
// ─────────────────────────────────────────

export async function approveApplication(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { default: prisma } = await import(
      "../config/database"
    );


    const application =
      await prisma.expertApplication.update({

        where:{
          id:String(req.params.id),
        },

        data:{
          status:"APPROVED",
          reviewedAt:new Date(),
        },

      });


    res.json({
      success:true,
      application,
    });


  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Approve failed",
    });

  }

}



// ─────────────────────────────────────────
// ADMIN - Reject
// ─────────────────────────────────────────

export async function rejectApplication(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { default: prisma } = await import(
      "../config/database"
    );


    const application =
      await prisma.expertApplication.update({

        where:{
          id:String(req.params.id),
        },

        data:{
          status:"REJECTED",
          reviewedAt:new Date(),
        },

      });


    res.json({
      success:true,
      application,
    });


  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Reject failed",
    });

  }

}