import prisma from "../config/database";
import { ApplicationStatus, ReviewStatus } from "../types";

// ─────────────────────────────────────────────────────────────
// ENTREPRENEUR
// ─────────────────────────────────────────────────────────────

export async function applyToProgram(
  applicantId: string,
  programId: string,
  amountRequested: number,
  coverLetter?: string
) {
  const program = await prisma.financingProgram.findUnique({
    where: {
      id: programId,
    },
  });

  if (!program || !program.isPublished) {
    throw new Error("PROGRAM_NOT_FOUND");
  }

  const existing = await prisma.application.findUnique({
    where: {
      programId_applicantId: {
        programId,
        applicantId,
      },
    },
  });

  if (existing) {
    throw new Error("ALREADY_APPLIED");
  }

  return prisma.application.create({
    data: {
      programId,
      applicantId,
      amountRequested: BigInt(amountRequested),
      coverLetter,
      status: ApplicationStatus.SUBMITTED,
    },
    include: {
      program: {
        select: {
          title: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// ENTREPRENEUR - List applications
// ─────────────────────────────────────────────────────────────

export async function listMyApplications(
  applicantId: string
) {
  return prisma.application.findMany({
    where: {
      applicantId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      program: {
        select: {
          title: true,
          category: true,
          institutionProfile: {
            select: {
              institutionName: true,
            },
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// ENTREPRENEUR - Withdraw application
// ─────────────────────────────────────────────────────────────

export async function withdrawApplication(
  id: string,
  applicantId: string
) {
  const application = await prisma.application.findUnique({
    where: {
      id,
    },
  });

  if (!application) {
    throw new Error("NOT_FOUND");
  }

  if (application.applicantId !== applicantId) {
    throw new Error("FORBIDDEN");
  }

  if (
    application.status ===
    ApplicationStatus.APPROVED
  ) {
    throw new Error("CANNOT_WITHDRAW");
  }

  await prisma.application.delete({
    where: {
      id,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// EXPERT APPLICATION
// Saves into ExpertApplication + AccountRequest
// ─────────────────────────────────────────────────────────────

export async function applyExpertApplication(data: {
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
  const expertApplication =
    await prisma.expertApplication.create({
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

  await prisma.accountRequest.create({
    data: {
      type: "EXPERT",
      email: data.email,
      fullName: data.fullName,
      data: {
        title: data.title,
        experience: data.experience,
        specialties: data.specialties,
        languages: data.languages,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        certifications: data.certifications,
        motivation: data.motivation,
        cvPath: data.cvPath ?? null,
      },
    },
  });

  return expertApplication;
}

// ─────────────────────────────────────────────────────────────
// INSTITUTION - List applications
// ─────────────────────────────────────────────────────────────

export async function listInstitutionApplications(
  institutionProfileId: string,
  params: {
    skip: number;
    limit: number;
    status?: string;
    programId?: string;
  }
) {
  const where = {
    program: {
      institutionProfileId,
    },

    ...(params.status
      ? {
          status:
            params.status as ApplicationStatus,
        }
      : {}),

    ...(params.programId
      ? {
          programId: params.programId,
        }
      : {}),
  };

  const [applications, total] =
    await Promise.all([
      prisma.application.findMany({
        where,
        skip: params.skip,
        take: params.limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          program: {
            select: {
              title: true,
              category: true,
            },
          },

          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),

      prisma.application.count({
        where,
      }),
    ]);

  return {
    applications,
    total,
  };
}

// ─────────────────────────────────────────────────────────────
// INSTITUTION - Update application status
// ─────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  id: string,
  institutionProfileId: string,
  status: ApplicationStatus,
  notes?: string
) {
  const application =
    await prisma.application.findUnique({
      where: {
        id,
      },

      include: {
        program: {
          select: {
            institutionProfileId: true,
          },
        },
      },
    });

  if (!application) {
    throw new Error("NOT_FOUND");
  }

  if (
    application.program.institutionProfileId !==
    institutionProfileId
  ) {
    throw new Error("FORBIDDEN");
  }

  return prisma.application.update({
    where: {
      id,
    },

    data: {
      status,
      notes,
      reviewedAt: new Date(),
    },
  });
}
