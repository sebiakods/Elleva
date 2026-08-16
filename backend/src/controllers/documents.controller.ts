// backend/src/controllers/documents.controller.ts
import { Request, Response, NextFunction } from "express";
import { documentsService } from "../services/documents.service";
import { prisma } from "../prisma";

function serializeDoc(doc: any) {
  return {
    ...doc,
    fileSizeBytes: doc.fileSizeBytes != null ? doc.fileSizeBytes.toString() : null,
  };
}

export const documentsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, institutionProfileId } = req.query;

      let targetInstitutionId = institutionProfileId as string | undefined;

      if (!targetInstitutionId && (req as any).user?.role === "INSTITUTION") {
        const profile = await prisma.institutionProfile.findUnique({
          where: { userId: (req as any).user.id },
        });
        targetInstitutionId = profile?.id;
      }

      const documents = await documentsService.list({
        institutionProfileId: targetInstitutionId,
        category: category as string,
        search: search as string,
      });

      res.json({ success: true, data: documents.map(serializeDoc) });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const doc = await documentsService.getById(id);
      if (!doc) {
        return res.status(404).json({ success: false, error: "Document introuvable" });
      }
      res.json({ success: true, data: serializeDoc(doc) });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await prisma.institutionProfile.findUnique({ where: { userId } });

      if (!profile) {
        return res.status(403).json({ success: false, error: "Profil institution introuvable" });
      }

      const { name, description, category, isRequired } = req.body;

      if (!name || !category) {
        return res.status(400).json({ success: false, error: "Nom et catégorie requis" });
      }

      const file = req.file as Express.Multer.File | undefined;

      const doc = await documentsService.create({
        name,
        description: description || "",
        type: category,
        isRequired: isRequired === "true" || isRequired === true,
        institutionProfileId: profile.id,
        fileUrl: file ? `/uploads/${file.filename}` : undefined,
        fileSizeBytes: file ? BigInt(file.size) : undefined,
      });

      res.status(201).json({ success: true, data: serializeDoc(doc) });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name, description, category, isRequired } = req.body;
      const doc = await documentsService.update(id, {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { type: category }),
        ...(isRequired !== undefined && {
          isRequired: isRequired === "true" || isRequired === true,
        }),
      });
      res.json({ success: true, data: serializeDoc(doc) });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await documentsService.remove(id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const doc = await documentsService.incrementDownload(id);
      res.json({ success: true, data: serializeDoc(doc) });
    } catch (error) {
      next(error);
    }
  },
};