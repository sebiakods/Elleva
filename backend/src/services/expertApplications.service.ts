import prisma from "../config/database";
import { ReviewStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Create expert application
// ─────────────────────────────────────────────────────────────

export async function createApplication(data: {
  fullName: string;
  email: string;
  title: string;
  experience: string;
  specialties: string;
  languages?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string;
  motivation: string;
  cvPath?: string | null;
}) {
  return prisma.expertApplication.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      title: data.title,
      experience: data.experience,
      specialties: data.specialties,
      languages: data.languages,
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      certifications: data.certifications,
      motivation: data.motivation,
      cvPath: data.cvPath ?? null,
      status: ReviewStatus.PENDING,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Get all expert applications
// ─────────────────────────────────────────────────────────────

export async function getApplications() {
  return prisma.expertApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Get one expert application
// ─────────────────────────────────────────────────────────────

export async function getApplication(id: string) {
  return prisma.expertApplication.findUnique({
    where: {
      id,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Approve expert application
// ─────────────────────────────────────────────────────────────

export async function approveApplication(id: string) {
  return prisma.expertApplication.update({
    where: {
      id,
    },
    data: {
      status: ReviewStatus.APPROVED,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Reject expert application
// ─────────────────────────────────────────────────────────────

export async function rejectApplication(
  id: string,
  comment?: string
) {
  return prisma.expertApplication.update({
    where: {
      id,
    },
    data: {
      status: ReviewStatus.REJECTED,
      adminComment: comment,
    },
  });
}

