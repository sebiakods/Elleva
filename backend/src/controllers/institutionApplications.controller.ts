import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../config/database";
import { env } from "../config/env";
import { Role } from "../types";
import { mailerService } from "../services/mailer.service";

const TYPE_TO_INSTITUTION_ENUM: Record<string, string> = {
  banque: "BANK",
  fonds_investissement: "INVESTOR",
  ong: "NGO",
  incubateur: "INCUBATOR",
  accelerateur: "ACCELERATOR",
  organisme_public: "GOVERNMENT",
};

function mapInstitutionType(raw?: string): string {
  return TYPE_TO_INSTITUTION_ENUM[raw?.toLowerCase()?.trim() ?? ""] ?? "GOVERNMENT";
}

// CREATE
export const createApplication = async (req: Request, res: Response) => {
  try {
    const {
      institutionName,
      organizationName,
      organizationType,
      wilaya,
      contactName,
      contactRole,
      email,
      password,
      phone,
      website,
      sectors,
      motivation,
    } = req.body;

    const name = institutionName || organizationName;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nom, email et mot de passe sont obligatoires.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name: name.trim(),
          role: Role.INSTITUTION,
          isActive: false,
          isVerified: false,
        },
      });

      const application = await tx.institutionApplication.create({
        data: {
          organizationName: name,
          organizationType,
          wilaya,
          contactName,
          contactRole,
          email: email.toLowerCase().trim(),
          phone,
          website,
          sectors,
          motivation,
          documentPath: req.file?.path ?? null,
        },
      });

      return { user, application };
    });

    res.status(201).json({
      success: true,
      application: result.application,
    });
  } catch (error) {
    console.error("CREATE INSTITUTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Create failed",
    });
  }
};

// GET ALL
export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await prisma.institutionApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Get failed" });
  }
};

// GET ONE
export const getApplication = async (req: Request, res: Response) => {
  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};


export const approveApplication = async (req: Request, res: Response) => {
  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Candidature introuvable" });
    }

    if (application.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Cette candidature a été rejetée." });
    }

    if (application.status === "APPROVED") {
      return res.status(400).json({ success: false, message: "Cette candidature a déjà été approuvée." });
    }

    const user = await prisma.user.findUnique({
      where: { email: application.email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(409).json({
        success: false,
        message:
          "Aucun compte n'est associé à cette candidature. Demandez à l'institution de soumettre à nouveau sa candidature.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          isVerified: true,
          role: Role.INSTITUTION,
        },
      });

      const updatedApplication = await tx.institutionApplication.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const existingProfile = await tx.institutionProfile.findUnique({
        where: { userId: updatedUser.id },
      });

      if (!existingProfile) {
        await tx.institutionProfile.create({
          data: {
            userId: updatedUser.id,
            institutionName: application.organizationName,
            type: mapInstitutionType(application.organizationType) as any,
            city: application.wilaya,
            websiteUrl: application.website || null,
            contactEmail: application.email,
            contactPhone: application.phone || null,
            isVerified: true,
          },
        });
      }

      return { application: updatedApplication, user: updatedUser };
    });

    await mailerService.sendInstitutionApproved(
      application.email,
      application.organizationName
    );

    return res.json({
      success: true,
      message: "Institution approved",
      application: updated.application,
    });
  } catch (error) {
    console.error("APPROVE INSTITUTION ERROR:", error);

    return res.status(500).json({ success: false, message: "Approve failed" });
  }
};

// REJECT — deletes the pending user so the email can be reused, sends email
export const rejectApplication = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason?: string };

    const application = await prisma.institutionApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Candidature introuvable" });
    }

    if (application.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Cette candidature a déjà été traitée." });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.institutionApplication.update({
        where: { id: application.id },
        data: { status: "REJECTED", adminComment: reason },
      });

      await tx.user.deleteMany({
        where: { email: application.email, isActive: false, isVerified: false },
      });

      return updatedApplication;
    });

    await mailerService.sendInstitutionRejected(
      application.email,
      application.organizationName,
      reason
    );

    res.json({ success: true, message: "Institution rejected", application: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reject failed" });
  }
};

// DELETE
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await prisma.user.deleteMany({ where: { email: application.email } });
    await prisma.institutionApplication.delete({ where: { id: application.id } });

    return res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};