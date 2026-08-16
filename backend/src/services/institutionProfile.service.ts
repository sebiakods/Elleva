import { prisma } from "../prisma";

export const institutionProfileService = {
  async getByUserId(userId: string) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT
        "id",
        "userId",
        "institutionName",
        "type"::text AS "type",
        "city",
        "address",
        "shortDescription",
        "description",
        "websiteUrl",
        "contactEmail",
        "contactPhone",
        "linkedinUrl",
        "facebookUrl",
        "logoUrl",
        "isVerified",
        "createdAt",
        "updatedAt"
      FROM "InstitutionProfile"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;

    return result[0] ?? null;
  },

  async update(
    userId: string,
    data: Partial<{
      institutionName: string;
      type: string;
      shortDescription: string;
      description: string;
      websiteUrl: string;
      contactEmail: string;
      contactPhone: string;
      address: string;
      city: string;
      linkedinUrl: string;
      facebookUrl: string;
      logoUrl: string;
    }>
  ) {
    await prisma.$executeRaw`
      UPDATE "InstitutionProfile"
      SET
        "institutionName" = COALESCE(
          ${data.institutionName ?? null},
          "institutionName"
        ),

        "type" = COALESCE(
          ${data.type ?? null}::"InstitutionType",
          "type"
        ),

        "city" = COALESCE(
          ${data.city ?? null},
          "city"
        ),

        "address" = COALESCE(
          ${data.address ?? null},
          "address"
        ),

        "shortDescription" = COALESCE(
          ${data.shortDescription ?? null},
          "shortDescription"
        ),

        "description" = COALESCE(
          ${data.description ?? null},
          "description"
        ),

        "websiteUrl" = COALESCE(
          ${data.websiteUrl ?? null},
          "websiteUrl"
        ),

        "contactEmail" = COALESCE(
          ${data.contactEmail ?? null},
          "contactEmail"
        ),

        "contactPhone" = COALESCE(
          ${data.contactPhone ?? null},
          "contactPhone"
        ),

        "linkedinUrl" = COALESCE(
          ${data.linkedinUrl ?? null},
          "linkedinUrl"
        ),

        "facebookUrl" = COALESCE(
          ${data.facebookUrl ?? null},
          "facebookUrl"
        ),

        "logoUrl" = COALESCE(
          ${data.logoUrl ?? null},
          "logoUrl"
        ),

        "updatedAt" = NOW()

      WHERE "userId" = ${userId}
    `;

    return this.getByUserId(userId);
  },
};