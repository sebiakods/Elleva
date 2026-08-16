// backend/src/controllers/expertProfile.controller.ts
import { Request, Response, NextFunction } from "express";
import { expertProfileService } from "../services/expertProfile.service";

export const expertProfileController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await expertProfileService.getByUserId(userId);
      if (!profile || !profile.expertProfile) {
        return res.status(404).json({ success: false, error: "Profil expert introuvable" });
      }
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { name, bio, title, specialties, sessionRateDA, availableForBooking, linkedinUrl, websiteUrl } =
        req.body;

      const file = req.file as Express.Multer.File | undefined;

      const userData: Record<string, any> = {};
      if (name !== undefined) userData.name = name;
      if (bio !== undefined) userData.bio = bio;
      if (file) userData.avatarUrl = `/uploads/${file.filename}`;

      const expertData: Record<string, any> = {};
      if (title !== undefined) expertData.title = title;
      if (specialties !== undefined) {
        // sent as JSON string from FormData
        expertData.specialties = typeof specialties === "string" ? JSON.parse(specialties) : specialties;
      }
      if (sessionRateDA !== undefined) expertData.sessionRateDA = Number(sessionRateDA);
      if (availableForBooking !== undefined) {
        expertData.availableForBooking = availableForBooking === "true" || availableForBooking === true;
      }
      if (linkedinUrl !== undefined) expertData.linkedinUrl = linkedinUrl;
      if (websiteUrl !== undefined) expertData.websiteUrl = websiteUrl;

      const updated = await expertProfileService.update(userId, userData, expertData);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
};