import { PrismaClient, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function createApplication(data: any) {
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
      status: ApplicationStatus.SUBMITTED,
    },
  });
}

export async function getApplications() {
  return prisma.expertApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApplication(id: string) {
  return prisma.expertApplication.findUnique({
    where: { id },
  });
}

export async function approveApplication(id: string) {
  return prisma.expertApplication.update({
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
  return prisma.expertApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.REJECTED,
      adminComment: comment,
    },
  });
}