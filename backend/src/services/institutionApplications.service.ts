import prisma from "../config/database";
import { ReviewStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Create institution application
// ─────────────────────────────────────────────────────────────

export async function createApplication(data: {
  email: string;
  phone?: string;
  website?: string;
  documentPath?: string | null;
  contactName: string;
  contactRole?: string;
  motivation: string;
  organizationName: string;
  organizationType: string;
  sectors?: string;
  wilaya: string;
}) {
  return prisma.institutionApplication.create({
    data: {
      email: data.email,
      phone: data.phone,
      website: data.website,
      documentPath: data.documentPath ?? null,
      contactName: data.contactName,
      contactRole: data.contactRole,
      motivation: data.motivation,
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      sectors: data.sectors,
      wilaya: data.wilaya,
      status: ReviewStatus.PENDING,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Get all institution applications
// ─────────────────────────────────────────────────────────────

export async function getApplications() {
  return prisma.institutionApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Get one institution application
// ─────────────────────────────────────────────────────────────

export async function getApplication(id: string) {
  return prisma.institutionApplication.findUnique({
    where: {
      id,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Approve institution application
// ─────────────────────────────────────────────────────────────

export async function approveApplication(id: string) {
  return prisma.institutionApplication.update({
    where: {
      id,
    },
    data: {
      status: ReviewStatus.APPROVED,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Reject institution application
// ─────────────────────────────────────────────────────────────

export async function rejectApplication(
  id: string,
  comment?: string
) {
  return prisma.institutionApplication.update({
    where: {
      id,
    },
    data: {
      status: ReviewStatus.REJECTED,
      adminComment: comment,
    },
  });
}

