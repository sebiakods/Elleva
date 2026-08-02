import prisma from "../config/database";
import { ProgramCategory } from "../types";

/* -------------------------------------------------------------------------- */
/*                               Serialize BigInt                             */
/* -------------------------------------------------------------------------- */

function serializeProgram(program: any) {
  return {
    ...program,

    amountMin:
      typeof program.amountMin === "bigint"
        ? Number(program.amountMin)
        : program.amountMin,

    amountMax:
      typeof program.amountMax === "bigint"
        ? Number(program.amountMax)
        : program.amountMax,
  };
}

/* -------------------------------------------------------------------------- */
/*                                List Programs                               */
/* -------------------------------------------------------------------------- */

export async function listPrograms(params: {
  skip: number;
  limit: number;
  category?: string;
  search?: string;
  publishedOnly?: boolean;
}) {
  const where: any = {};

  if (params.publishedOnly) {
    where.isPublished = true;
    where.isArchived = false;
  }

  if (params.category) {
    where.category = params.category as ProgramCategory;
  }

  if (params.search) {
    where.OR = [
      {
        title: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: params.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [programs, total] = await Promise.all([
    prisma.financingProgram.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        institutionProfile: {
          select: {
            institutionName: true,
            type: true,
            city: true,
            contactEmail: true,
          },
        },

        _count: {
          select: {
            applications: true,
            favoritePrograms: true,
          },
        },
      },
    }),

    prisma.financingProgram.count({
      where,
    }),
  ]);

  return {
    programs: programs.map(serializeProgram),
    total,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Get One Program                               */
/* -------------------------------------------------------------------------- */

export async function getProgramBySlug(slug: string) {
  const program = await prisma.financingProgram.findUnique({
    where: {
      slug,
    },

    include: {
      institutionProfile: {
        select: {
          institutionName: true,
          type: true,
          city: true,
          contactEmail: true,
          contactPhone: true,
          websiteUrl: true,
        },
      },

      _count: {
        select: {
          applications: true,
          favoritePrograms: true,
        },
      },
    },
  });

  if (!program) {
    throw new Error("NOT_FOUND");
  }

  return serializeProgram(program);
}

/* -------------------------------------------------------------------------- */
/*                               Create Program                               */
/* -------------------------------------------------------------------------- */

export async function createProgram(
  institutionProfileId: string,
  data: {
    slug: string;

    title: string;
    shortDescription?: string;
    description: string;

    category: ProgramCategory;

    sector?: string;
    fundingType?: string;

    amountMin?: number | null;
    amountMax?: number | null;
    currency?: string;

    openingDate?: string;
    closingDate?: string;

    region?: string;

    targetAudience?: string;

    eligibility: string[];
    requiredDocuments: string[];

    website?: string;
    email?: string;
    phone?: string;

    status: "draft" | "published";
  }
) {
  const existing = await prisma.financingProgram.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existing) {
    throw new Error("SLUG_TAKEN");
  }

  const program = await prisma.financingProgram.create({
    data: {
      institutionProfileId,

      slug: data.slug,

      title: data.title,
      shortDescription: data.shortDescription || null,
      description: data.description,

      category: data.category,

      sector: data.sector || null,
      fundingType: data.fundingType || null,

      amountMin: BigInt(data.amountMin ?? 0),
      amountMax: BigInt(data.amountMax ?? 0),

      currency: data.currency || "DZD",

      openingDate: data.openingDate
        ? new Date(data.openingDate)
        : null,

      closingDate: data.closingDate
        ? new Date(data.closingDate)
        : null,

      region: data.region || null,

      targetAudience: data.targetAudience || null,

      eligibility: data.eligibility,

      requiredDocuments: data.requiredDocuments,

      website: data.website || null,
      email: data.email || null,
      phone: data.phone || null,

      isPublished: data.status === "published",
      isArchived: false,
    },
  });

  return serializeProgram(program);
}
/* -------------------------------------------------------------------------- */
/*                               Update Program                               */
/* -------------------------------------------------------------------------- */

export async function updateProgram(
  id: string,
  institutionProfileId: string,
  data: Partial<{
    slug: string;

    title: string;
    shortDescription: string;
    description: string;

    category: ProgramCategory;

    sector: string;
    fundingType: string;

    amountMin: number | null;
    amountMax: number | null;
    currency: string;

    openingDate: string;
    closingDate: string;

    region: string;

    targetAudience: string;

    eligibility: string[];
    requiredDocuments: string[];

    website: string;
    email: string;
    phone: string;

    status: "draft" | "published";
  }>
) {
  const program = await prisma.financingProgram.findUnique({
    where: { id },
  });

  if (!program) {
    throw new Error("NOT_FOUND");
  }

  if (program.institutionProfileId !== institutionProfileId) {
    throw new Error("FORBIDDEN");
  }

  const updateData: any = {};

  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.shortDescription !== undefined)
    updateData.shortDescription = data.shortDescription || null;
  if (data.description !== undefined)
    updateData.description = data.description;

  if (data.category !== undefined)
    updateData.category = data.category;

  if (data.sector !== undefined)
    updateData.sector = data.sector || null;

  if (data.fundingType !== undefined)
    updateData.fundingType = data.fundingType || null;

  if (data.currency !== undefined)
    updateData.currency = data.currency;

  if (data.region !== undefined)
    updateData.region = data.region || null;

  if (data.targetAudience !== undefined)
    updateData.targetAudience = data.targetAudience || null;

  if (data.website !== undefined)
    updateData.website = data.website || null;

  if (data.email !== undefined)
    updateData.email = data.email || null;

  if (data.phone !== undefined)
    updateData.phone = data.phone || null;

  if (data.eligibility !== undefined)
    updateData.eligibility = data.eligibility;

  if (data.requiredDocuments !== undefined)
    updateData.requiredDocuments = data.requiredDocuments;

  if (data.amountMin != null) {
    updateData.amountMin = BigInt(data.amountMin);
  }

  if (data.amountMax != null) {
    updateData.amountMax = BigInt(data.amountMax);
  }

  if (data.openingDate !== undefined) {
    updateData.openingDate = data.openingDate
      ? new Date(data.openingDate)
      : null;
  }

  if (data.closingDate !== undefined) {
    updateData.closingDate = data.closingDate
      ? new Date(data.closingDate)
      : null;
  }

  if (data.status !== undefined) {
    updateData.isPublished = data.status === "published";
  }

  const updated = await prisma.financingProgram.update({
    where: { id },
    data: updateData,
  });

  return serializeProgram(updated);
}

/* -------------------------------------------------------------------------- */
/*                               Delete Program                               */
/* -------------------------------------------------------------------------- */

export async function deleteProgram(
  id: string,
  institutionProfileId: string
) {
  const program = await prisma.financingProgram.findUnique({
    where: { id },
  });

  if (!program) {
    throw new Error("NOT_FOUND");
  }

  if (program.institutionProfileId !== institutionProfileId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.financingProgram.delete({
    where: { id },
  });

  return true;
}

/* -------------------------------------------------------------------------- */
/*                              User Favorites                                */
/* -------------------------------------------------------------------------- */

export async function getUserFavorites(userId: string) {
  const favorites = await prisma.favoriteProgram.findMany({
    where: {
      userId,
    },

    include: {
      program: {
        include: {
          institutionProfile: {
            select: {
              institutionName: true,
              city: true,
            },
          },

          _count: {
            select: {
              applications: true,
              favoritePrograms: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return favorites.map((favorite) => ({
    ...favorite,
    program: serializeProgram(favorite.program),
  }));
}

/* -------------------------------------------------------------------------- */
/*                             Toggle Favorite                                */
/* -------------------------------------------------------------------------- */

export async function toggleFavorite(
  userId: string,
  programId: string
) {
  const program = await prisma.financingProgram.findUnique({
    where: {
      id: programId,
    },
  });

  if (!program) {
    throw new Error("NOT_FOUND");
  }

  const existing = await prisma.favoriteProgram.findUnique({
    where: {
      userId_programId: {
        userId,
        programId,
      },
    },
  });

  if (existing) {
    await prisma.favoriteProgram.delete({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
    });

    return {
      favorited: false,
    };
  }

  await prisma.favoriteProgram.create({
    data: {
      userId,
      programId,
    },
  });

  return {
    favorited: true,
  };
}