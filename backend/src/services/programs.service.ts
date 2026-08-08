import {
  Prisma,
  ProgramCategory,
  ApplicationStatus,
} from "@prisma/client";
import { prisma } from "../prisma";

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: ProgramCategory;
  sector?: string;
  region?: string;
  isPublished?: boolean;
  isArchived?: boolean;
  sort?: "newest" | "oldest" | "amountAsc" | "amountDesc";
}

export interface CreateProgramInput {
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: ProgramCategory;
  sector?: string;
  fundingType?: string;

  amountMin: string | number | bigint;
  amountMax: string | number | bigint;

  currency?: string;

  openingDate?: string | Date | null;
  closingDate?: string | Date | null;

  region?: string;
  targetAudience?: string;

  eligibility?: string[];
  requiredDocuments?: string[];

  website?: string;
  email?: string;
  phone?: string;
}

export type UpdateProgramInput = Partial<CreateProgramInput> & {
  isPublished?: boolean;
  isArchived?: boolean;
};

function toBigInt(
  value: string | number | bigint | undefined
): bigint | undefined {
  if (value === undefined || value === null) return undefined;

  return typeof value === "bigint"
    ? value
    : BigInt(value);
}
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.financingProgram.findUnique({
    where: { slug },
    select: { id: true },
  })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
function buildOrderBy(
  sort?: ListQuery["sort"]
): Prisma.FinancingProgramOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return {
        createdAt: "asc",
      };

    case "amountAsc":
      return {
        amountMin: "asc",
      };

    case "amountDesc":
      return {
        amountMax: "desc",
      };

    case "newest":
    default:
      return {
        createdAt: "desc",
      };
  }
}

function buildSearchFilter(
  search?: string
): Prisma.FinancingProgramWhereInput {
  if (!search?.trim()) {
    return {};
  }

  const q = search.trim();

  return {
    OR: [
      {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        sector: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        region: {
          contains: q,
          mode: "insensitive",
        },
      },
    ],
  };
}

function buildCommonFilters(
  query: ListQuery
): Prisma.FinancingProgramWhereInput {
  const where: Prisma.FinancingProgramWhereInput = {};

  if (query.category) {
    where.category = query.category;
  }

  if (query.sector) {
    where.sector = query.sector;
  }

  if (query.region) {
    where.region = query.region;
  }

  if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished;
  }

  if (query.isArchived !== undefined) {
    where.isArchived = query.isArchived;
  }

  return where;
}

async function paginate(
  where: Prisma.FinancingProgramWhereInput,
  query: ListQuery,
  include: Prisma.FinancingProgramInclude
) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(
    100,
    Math.max(1, query.pageSize ?? 12)
  );

  const fullWhere: Prisma.FinancingProgramWhereInput = {
    AND: [
      where,
      buildSearchFilter(query.search),
      buildCommonFilters(query),
    ],
  };

  const [items, total] = await Promise.all([
    prisma.financingProgram.findMany({
      where: fullWhere,
      include,
      orderBy: buildOrderBy(query.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.financingProgram.count({
      where: fullWhere,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / pageSize)
      ),
    },
  };
}

const withApplicationCount: Prisma.FinancingProgramInclude = {
  _count: {
    select: {
      applications: true,
    },
  },
};

const withInstitutionAndCount: Prisma.FinancingProgramInclude = {
  _count: {
    select: {
      applications: true,
    },
  },

  institutionProfile: {
    select: {
      id: true,
      userId: true,
      institutionName: true,
      city: true,
      type: true,
      logoUrl: true,
      websiteUrl: true,
    },
  },
};
// -----------------------------------------------------------------------------
// INSTITUTION
// -----------------------------------------------------------------------------

export async function listInstitutionPrograms(
  userId: string,
  query: ListQuery
) {
  return paginate(
    {
      institutionProfile: {
        userId,
      },
    },
    query,
    withApplicationCount
  );
}

export async function getInstitutionProgramById(
  userId: string,
  id: string
) {
  return prisma.financingProgram.findFirst({
    where: {
      id,
      institutionProfile: {
        userId,
      },
    },
    include: withApplicationCount,
  });
}

export async function createProgram(
  userId: string,
  data: CreateProgramInput
) {
  const institutionProfile =
    await prisma.institutionProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!institutionProfile) {
    throw Object.assign(
      new Error("Institution profile not found"),
      {
        statusCode: 404,
      }
    );
  }

  const slug = await generateUniqueSlug(data.slug);

  return prisma.financingProgram.create({
    data: {
      slug,

      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,

      category: data.category,

      sector: data.sector,
      fundingType: data.fundingType,

      amountMin: toBigInt(data.amountMin)!,
      amountMax: toBigInt(data.amountMax)!,

      currency: data.currency ?? "DZD",

      openingDate: data.openingDate
        ? new Date(data.openingDate)
        : null,

      closingDate: data.closingDate
        ? new Date(data.closingDate)
        : null,

      region: data.region,
      targetAudience: data.targetAudience,

      eligibility: data.eligibility ?? [],
      requiredDocuments: data.requiredDocuments ?? [],

      website: data.website,
      email: data.email,
      phone: data.phone,

      institutionProfileId: institutionProfile.id,
    },
  });
}

async function assertOwnedByInstitution(
  userId: string,
  id: string
) {
  const program =
    await prisma.financingProgram.findFirst({
      where: {
        id,
        institutionProfile: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw Object.assign(
      new Error(
        "Program not found or access denied"
      ),
      {
        statusCode: 404,
      }
    );
  }

  return program;
}

export async function updateOwnProgram(
  userId: string,
  id: string,
  data: UpdateProgramInput
) {
  await assertOwnedByInstitution(userId, id);

  return prisma.financingProgram.update({
    where: {
      id,
    },

    data: {
      // Do NOT update slug.
      // The existing unique slug remains unchanged.

      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      category: data.category,
      sector: data.sector,
      fundingType: data.fundingType,

      amountMin:
        data.amountMin !== undefined
          ? toBigInt(data.amountMin)
          : undefined,

      amountMax:
        data.amountMax !== undefined
          ? toBigInt(data.amountMax)
          : undefined,

      currency: data.currency,

      openingDate:
        data.openingDate !== undefined
          ? data.openingDate
            ? new Date(data.openingDate)
            : null
          : undefined,

      closingDate:
        data.closingDate !== undefined
          ? data.closingDate
            ? new Date(data.closingDate)
            : null
          : undefined,

      region: data.region,
      targetAudience: data.targetAudience,

      eligibility: data.eligibility,
      requiredDocuments: data.requiredDocuments,

      website: data.website,
      email: data.email,
      phone: data.phone,

      isPublished: data.isPublished,
    },
  });
}

export async function deleteOwnProgram(
  userId: string,
  id: string
) {
  await assertOwnedByInstitution(
    userId,
    id
  );

  return prisma.financingProgram.delete({
    where: {
      id,
    },
  });
}

export async function setPublishStatus(
  userId: string,
  id: string,
  isPublished: boolean
) {
  await assertOwnedByInstitution(
    userId,
    id
  );

  return prisma.financingProgram.update({
    where: {
      id,
    },
    data: {
      isPublished,
    },
  });
}

export async function setArchiveStatus(
  userId: string,
  id: string,
  isArchived: boolean
) {
  await assertOwnedByInstitution(
    userId,
    id
  );

  return prisma.financingProgram.update({
    where: {
      id,
    },
    data: {
      isArchived,
    },
  });
}

export async function getOwnProgramApplications(
  userId: string,
  id: string
) {
  await assertOwnedByInstitution(
    userId,
    id
  );

  return prisma.application.findMany({
    where: {
      programId: id,
    },

    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInstitutionStats(
  userId: string
) {
  const institution =
    await prisma.institutionProfile.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
      },
    });

  if (!institution) {
    return {
      total: 0,
      published: 0,
      archived: 0,
      draft: 0,
      totalApplications: 0,
    };
  }

  const [
    total,
    published,
    archived,
    totalApplications,
  ] = await Promise.all([
    prisma.financingProgram.count({
      where: {
        institutionProfileId:
          institution.id,
      },
    }),

    prisma.financingProgram.count({
      where: {
        institutionProfileId:
          institution.id,
        isPublished: true,
      },
    }),

    prisma.financingProgram.count({
      where: {
        institutionProfileId:
          institution.id,
        isArchived: true,
      },
    }),

    prisma.application.count({
      where: {
        program: {
          institutionProfileId:
            institution.id,
        },
      },
    }),
  ]);

  return {
    total,
    published,
    archived,
    draft: total - published,
    totalApplications,
  };
}
// -----------------------------------------------------------------------------
// ENTREPRENEUR / PUBLIC
// -----------------------------------------------------------------------------

export async function listPublicPrograms(query: ListQuery) {
  return paginate(
    {
      isPublished: true,
      isArchived: false,
    },
    {
      ...query,
      isPublished: undefined,
      isArchived: undefined,
    },
    withInstitutionAndCount
  );
}

export async function getPublicProgramById(id: string) {
  return prisma.financingProgram.findFirst({
    where: {
      id,
      isPublished: true,
      isArchived: false,
    },
    include: withInstitutionAndCount,
  });
}

export async function applyToProgram(
  userId: string,
  programId: string,
  amountRequested: bigint
) {
  const program = await prisma.financingProgram.findFirst({
    where: {
      id: programId,
      isPublished: true,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!program) {
    throw Object.assign(
      new Error("Program not available"),
      { statusCode: 404 }
    );
  }

  const existing = await prisma.application.findFirst({
    where: {
      applicantId: userId,
      programId,
    },
  });

  if (existing) {
    throw Object.assign(
      new Error("You already applied to this program"),
      { statusCode: 409 }
    );
  }

  return prisma.application.create({
    data: {
      applicantId: userId,
      programId,
      amountRequested,
      status: ApplicationStatus.SUBMITTED,
    },
  });
}

export async function addFavorite(
  userId: string,
  programId: string
) {
  const existing = await prisma.favoriteProgram.findUnique({
    where: {
      userId_programId: {
        userId,
        programId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.favoriteProgram.create({
    data: {
      userId,
      programId,
    },
  });
}

export async function removeFavorite(
  userId: string,
  programId: string
) {
  const existing = await prisma.favoriteProgram.findUnique({
    where: {
      userId_programId: {
        userId,
        programId,
      },
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.favoriteProgram.delete({
    where: {
      id: existing.id,
    },
  });
}

export async function listMyApplications(
  userId: string
) {
  return prisma.application.findMany({
    where: {
      applicantId: userId,
    },

    include: {
      program: {
        include: {
          institutionProfile: {
            select: {
              id: true,
              institutionName: true,
              city: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// -----------------------------------------------------------------------------
// EXPERT
// -----------------------------------------------------------------------------

export async function listExpertPrograms(
  query: ListQuery
) {
  return paginate(
    {
      isPublished: true,
      isArchived: false,
    },
    {
      ...query,
      isPublished: undefined,
      isArchived: undefined,
    },
    withInstitutionAndCount
  );
}

export async function getExpertProgramById(
  id: string
) {
  return prisma.financingProgram.findFirst({
    where: {
      id,
      isPublished: true,
      isArchived: false,
    },
    include: withInstitutionAndCount,
  });
}
// -----------------------------------------------------------------------------
// ADMIN
// -----------------------------------------------------------------------------

export async function listAllPrograms(
  query: ListQuery
) {
  return paginate(
    {},
    query,
    withInstitutionAndCount
  );
}

export async function getAnyProgramById(
  id: string
) {
  return prisma.financingProgram.findUnique({
    where: {
      id,
    },
    include: withInstitutionAndCount,
  });
}

export async function adminUpdateProgram(
  id: string,
  data: UpdateProgramInput
) {
  const program =
    await prisma.financingProgram.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw Object.assign(
      new Error("Program not found"),
      {
        statusCode: 404,
      }
    );
  }

  return prisma.financingProgram.update({
    where: {
      id,
    },

    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      category: data.category,
      sector: data.sector,
      fundingType: data.fundingType,

      amountMin:
        data.amountMin !== undefined
          ? toBigInt(data.amountMin)
          : undefined,

      amountMax:
        data.amountMax !== undefined
          ? toBigInt(data.amountMax)
          : undefined,

      currency: data.currency,

      openingDate:
        data.openingDate !== undefined
          ? data.openingDate
            ? new Date(data.openingDate)
            : null
          : undefined,

      closingDate:
        data.closingDate !== undefined
          ? data.closingDate
            ? new Date(data.closingDate)
            : null
          : undefined,

      region: data.region,
      targetAudience: data.targetAudience,

      eligibility: data.eligibility,
      requiredDocuments: data.requiredDocuments,

      website: data.website,
      email: data.email,
      phone: data.phone,
    },
  });
}

export async function adminDeleteProgram(
  id: string
) {
  const program =
    await prisma.financingProgram.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw Object.assign(
      new Error("Program not found"),
      {
        statusCode: 404,
      }
    );
  }

  return prisma.financingProgram.delete({
    where: {
      id,
    },
  });
}

export async function adminSetPublishStatus(
  id: string,
  isPublished: boolean
) {
  const program =
    await prisma.financingProgram.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw Object.assign(
      new Error("Program not found"),
      {
        statusCode: 404,
      }
    );
  }

  return prisma.financingProgram.update({
    where: {
      id,
    },
    data: {
      isPublished,
    },
  });
}

export async function adminSetArchiveStatus(
  id: string,
  isArchived: boolean
) {
  const program =
    await prisma.financingProgram.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw Object.assign(
      new Error("Program not found"),
      {
        statusCode: 404,
      }
    );
  }

  return prisma.financingProgram.update({
    where: {
      id,
    },
    data: {
      isArchived,
    },
  });
}
