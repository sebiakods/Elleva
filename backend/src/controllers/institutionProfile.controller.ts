import { Request, Response, NextFunction } from "express";
import { institutionProfileService } from "../services/institutionProfile.service";

// frontend <-> Prisma enum mapping
const TYPE_TO_ENUM: Record<string, string> = {
  banque: "BANK",
  fonds_investissement: "INVESTOR",
  ong: "NGO",
  incubateur: "INCUBATOR",
  organisme_public: "GOVERNMENT",
};

const ENUM_TO_TYPE: Record<string, string> = {
  BANK: "banque",
  INVESTOR: "fonds_investissement",
  NGO: "ong",
  INCUBATOR: "incubateur",
  GOVERNMENT: "organisme_public",
  ACCELERATOR: "incubateur", // no direct frontend equivalent yet
};

function serialize(profile: any) {
  return { ...profile, type: ENUM_TO_TYPE[profile.type] ?? profile.type };
}

export const institutionProfileController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await institutionProfileService.getByUserId(userId);
      if (!profile) {
        return res.status(404).json({ success: false, error: "Profil introuvable" });
      }
      res.json({ success: true, data: serialize(profile) });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const {
        name,
        type,
        shortDescription,
        description,
        website,
        email,
        phone,
        address,
        region,
        linkedin,
        facebook,
      } = req.body;

      const file = req.file as Express.Multer.File | undefined;

      const data: Record<string, any> = {};
      if (name !== undefined) data.institutionName = name;
      if (type !== undefined) data.type = TYPE_TO_ENUM[type] ?? type;
      if (shortDescription !== undefined) data.shortDescription = shortDescription;
      if (description !== undefined) data.description = description;
      if (website !== undefined) data.websiteUrl = website;
      if (email !== undefined) data.contactEmail = email;
      if (phone !== undefined) data.contactPhone = phone;
      if (address !== undefined) data.address = address;
      if (region !== undefined) data.city = region;
      if (linkedin !== undefined) data.linkedinUrl = linkedin;
      if (facebook !== undefined) data.facebookUrl = facebook;
      if (file) data.logoUrl = `/uploads/${file.filename}`;

      const profile = await institutionProfileService.update(userId, data);
      res.json({ success: true, data: serialize(profile) });
    } catch (error) {
      next(error);
    }
  },
};