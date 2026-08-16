// backend/src/services/documents.service.ts
import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

interface ListDocumentsParams {
  institutionProfileId?: string;
  category?: string;
  search?: string;
}

export const documentsService = {
  async list(params: ListDocumentsParams) {
    const { institutionProfileId, category, search } = params;

    const where: any = {};
    if (institutionProfileId) where.institutionProfileId = institutionProfileId;
    if (category && category !== "all") where.type = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.institutionDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { institutionProfile: { select: { institutionName: true } } },
    });
  },

  async getById(id: string) {
    return prisma.institutionDocument.findUnique({
      where: { id },
      include: { institutionProfile: { select: { institutionName: true } } },
    });
  },

  async create(data: {
    name: string;
    description?: string;
    type: string;
    isRequired?: boolean;
    institutionProfileId: string;
    fileUrl?: string;
    fileSizeBytes?: bigint;
  }) {
    return prisma.institutionDocument.create({
      data: {
        ...data,
        description: data.description ?? "", // Defaults to empty string to satisfy required schema
      },
    });
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      type: string;
      isRequired: boolean;
      fileUrl: string;
      fileSizeBytes: bigint;
    }>
  ) {
    return prisma.institutionDocument.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    const doc = await prisma.institutionDocument.findUnique({ where: { id } });
    if (doc?.fileUrl) {
      const filePath = path.join(process.cwd(), doc.fileUrl.replace(/^\//, ""));
      fs.unlink(filePath, () => {});
    }
    return prisma.institutionDocument.delete({ where: { id } });
  },

  async incrementDownload(id: string) {
    return prisma.institutionDocument.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  },
};