import { PrismaClient, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function createApplication(data: any) {
  return prisma.institutionApplication.create({
    data: {
      institutionName: data.institutionName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      city: data.city,
      description: data.description,
      documentPath: data.documentPath ?? null,
      status: ApplicationStatus.SUBMITTED,
    },
  });
}

export async function getApplications() {
  return prisma.institutionApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApplication(id: string) {
  return prisma.institutionApplication.findUnique({
    where: { id },
  });
}

export async function approveApplication(id: string) {
  return prisma.institutionApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.APPROVED,
    },
  });
}

export async function rejectApplication(
  id: string,
  comment?: string
) {
  return prisma.institutionApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.REJECTED,
      adminComment: comment,
    },
  });
}