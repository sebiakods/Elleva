// backend/src/controllers/accountRequests.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { env } from "../config/env";
import { mailerService } from "../services/mailer.service";

type ExpertRequestData = {
  password: string; // plaintext, hashed immediately below
  title?: string;
  experience?: string;
  specialties?: string; // comma-separated free text
  languages?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string;
  motivation?: string;
  cvPath?: string | null;
};

type InstitutionRequestData = {
  password: string;
  organizationType?: string;
  wilaya?: string;
  contactName?: string;
  contactRole?: string;
  phone?: string;
  website?: string;
  sectors?: string;
  motivation?: string;
  documentPath?: string | null;
};

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

function parseSpecialties(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
}


export async function createRequest(req: Request, res: Response) {
  try {
    const { type, email, fullName, data } = req.body as {
      type: "EXPERT" | "INSTITUTION";
      email: string;
      fullName?: string;
      data: Record<string, any>;
    };

    if (!type || !email || !data?.password) {
      return res.status(400).json({
        success: false,
        message: "Type, email et mot de passe sont obligatoires",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const existingPendingRequest = await prisma.accountRequest.findFirst({
      where: { email: normalizedEmail, status: "PENDING" },
    });
    if (existingPendingRequest) {
      return res.status(409).json({
        success: false,
        message: "Une demande est déjà en attente pour cette adresse email.",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const { password, ...restData } = data;

    const request = await prisma.accountRequest.create({
      data: {
        type,
        email: normalizedEmail,
        fullName,
        data: { ...restData, passwordHash },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Demande créée avec succès",
      request,
    });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


export async function getRequests(req: Request, res: Response) {
  try {
    const requests = await prisma.accountRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, requests });
  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Error fetching requests" });
  }
}

export async function getRequestById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const request = await prisma.accountRequest.findUnique({ where: { id: String(id) } });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    return res.json({ success: true, request });
  } catch (error) {
    console.error("GET REQUEST BY ID ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// backend/src/controllers/accountRequests.controller.ts — replace the approveRequest function

export async function approveRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const request = await prisma.accountRequest.findUnique({ where: { id: String(id) } });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Allow re-processing a request that was marked APPROVED by the old
    // buggy handler but never actually got a User created for it.
    if (request.status !== "PENDING") {
      const alreadyHasUser = await prisma.user.findUnique({ where: { email: request.email } });
      if (alreadyHasUser) {
        return res.status(400).json({ success: false, message: "Cette demande a déjà été traitée." });
      }
      // status says APPROVED/REJECTED but no user exists — fall through and create it.
    }

    const data = request.data as Record<string, any>;

    let passwordHash: string | undefined = data?.passwordHash;
    if (!passwordHash && data?.password) {
      // Legacy row from before we started hashing at submission time.
      passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    }

    if (!passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe manquant sur la demande — impossible de créer le compte.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.accountRequest.update({
        where: { id: request.id },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });

      const user = await tx.user.create({
        data: {
          email: request.email,
          passwordHash: passwordHash!,
          name: request.fullName ?? request.email,
          role: request.type === "EXPERT" ? "EXPERT" : "INSTITUTION",
          isActive: true,
          isVerified: true,
        },
      });

      if (request.type === "EXPERT") {
        const d = data as ExpertRequestData;
        await tx.expertProfile.create({
          data: {
            userId: user.id,
            title: d.title ?? "",
            specialties: parseSpecialties(d.specialties),
            sessionRateDA: 0,
            availableForBooking: true,
            linkedinUrl: d.linkedin || null,
            websiteUrl: d.portfolio || null,
            isApprovedByAdmin: true,
          },
        });
      } else {
        const d = data as InstitutionRequestData;
        await tx.institutionProfile.create({
          data: {
            userId: user.id,
            institutionName: request.fullName ?? request.email,
            type: mapInstitutionType(d.organizationType) as any,
            city: d.wilaya ?? "",
            websiteUrl: d.website || null,
            contactEmail: request.email,
            contactPhone: d.phone || null,
            isVerified: true,
          },
        });
      }

      return updatedRequest;
    });

    if (request.type === "EXPERT") {
      await mailerService.sendExpertApproved(request.email, request.fullName ?? "");
    } else {
      await mailerService.sendInstitutionApproved(request.email, request.fullName ?? "");
    }

    return res.json({ success: true, message: "Request approved", request: updated });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return res.status(500).json({ success: false, message: "Approve failed" });
  }
}


export async function rejectRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    const request = await prisma.accountRequest.findUnique({ where: { id: String(id) } });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (request.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Cette demande a déjà été traitée." });
    }

    const updated = await prisma.accountRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", reviewedAt: new Date(), rejectionReason: reason },
    });

    if (request.type === "EXPERT") {
      await mailerService.sendExpertRejected(request.email, request.fullName ?? "", reason);
    } else {
      await mailerService.sendInstitutionRejected(request.email, request.fullName ?? "", reason);
    }

    return res.json({ success: true, message: "Request rejected", request: updated });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    return res.status(500).json({ success: false, message: "Reject failed" });
  }
}

export async function deleteRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.accountRequest.delete({ where: { id: String(id) } });
    return res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
}