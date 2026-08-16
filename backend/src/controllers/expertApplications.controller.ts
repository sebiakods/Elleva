// backend/src/controllers/expertApplications.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../config/database";
import { env } from "../config/env";
import { Role } from "../types";
import { mailerService } from "../services/mailer.service";

function parseSpecialties(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// CREATE
export const createApplication = async (req: Request, res: Response) => {
  try {
    const {
      fullName, email, password, title, experience,
      specialties, languages, linkedin, portfolio,
      certifications, motivation,
    } = req.body;

    if (!fullName || !email || !password) {
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
          name: fullName.trim(),
          role: Role.EXPERT,
          isActive: false,
          isVerified: false,
        },
      });

      const application = await tx.expertApplication.create({
        data: {
          fullName, email: email.toLowerCase().trim(), title, experience,
          specialties, languages, linkedin, portfolio, certifications, motivation,
          cvPath: req.file?.path ?? null,
        },
      });

      return { user, application };
    });

    res.status(201).json({ success: true, application: result.application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Create failed" });
  }
};

// GET ALL
export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await prisma.expertApplication.findMany({
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
    const application = await prisma.expertApplication.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!application) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// APPROVE — activates the user created at submission time, creates
// ExpertProfile, sends the approval email.
//
// The User row must already exist (createApplication creates it as
// inactive/unverified). We deliberately never fabricate a password here:
// the plaintext was never stored, so a "no user found" state can't be
// safely recovered from — it means something upstream went wrong and the
// applicant needs to resubmit.
export const approveApplication = async (req: Request, res: Response) => {
  try {
    const application = await prisma.expertApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature introuvable",
      });
    }

    if (application.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Cette candidature a été rejetée.",
      });
    }

    if (application.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Cette candidature a déjà été approuvée.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: application.email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(409).json({
        success: false,
        message:
          "Aucun compte n'est associé à cette candidature. Demandez à la candidate de soumettre à nouveau sa candidature.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          isVerified: true,
          role: Role.EXPERT,
        },
      });

      const updatedApplication = await tx.expertApplication.update({
        where: { id: application.id },
        data: { status: "APPROVED" },
      });

      const existingProfile = await tx.expertProfile.findUnique({
        where: { userId: updatedUser.id },
      });

      if (!existingProfile) {
        await tx.expertProfile.create({
          data: {
            userId: updatedUser.id,
            title: application.title,
            specialties: parseSpecialties(application.specialties),
            sessionRateDA: 0,
            availableForBooking: true,
            linkedinUrl: application.linkedin || null,
            websiteUrl: application.portfolio || null,
            isApprovedByAdmin: true,
          },
        });
      }

      return { application: updatedApplication, user: updatedUser };
    });

    await mailerService.sendExpertApproved(
      application.email,
      application.fullName
    );

    return res.json({
      success: true,
      message: "Expert approved",
      application: updated.application,
    });
  } catch (error) {
    console.error("APPROVE EXPERT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Approve failed",
    });
  }
};

// REJECT — deletes the pending user so the email can be reused, sends email
export const rejectApplication = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason?: string };

    const application = await prisma.expertApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application introuvable" });
    }

    if (application.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Cette candidature a déjà été traitée." });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.expertApplication.update({
        where: { id: application.id },
        data: { status: "REJECTED", adminComment: reason },
      });

      // Delete the never-activated user so the email is free for a future application
      await tx.user.deleteMany({
        where: { email: application.email, isActive: false, isVerified: false },
      });

      return updatedApplication;
    });

    await mailerService.sendExpertRejected(application.email, application.fullName, reason);

    res.json({ success: true, message: "Expert rejected", application: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reject failed" });
  }
};

// DELETE
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const application = await prisma.expertApplication.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await prisma.user.deleteMany({ where: { email: application.email } });
    await prisma.expertApplication.delete({ where: { id: application.id } });

    return res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};