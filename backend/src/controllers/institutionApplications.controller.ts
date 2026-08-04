import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../config/database";
import { env } from "../config/env";
import { Role } from "../types";

// CREATE
export const createApplication = async (
  req: Request,
  res: Response
) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {
    const {
      institutionName,
      organizationName,
      organizationType,
      wilaya,
      contactName,
      contactRole,
      email,
      password,
      phone,
      website,
      sectors,
      motivation,
    } = req.body;

    const name = institutionName || organizationName;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nom, email et mot de passe sont obligatoires.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      env.BCRYPT_ROUNDS
    );

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name: name.trim(),
          role: Role.INSTITUTION,
          isActive: false,
          isVerified: false,
        },
      });

    const application = await tx.institutionApplication.create({
      data: {
        organizationName: name,
        organizationType,
        wilaya,

        contactName,
        contactRole,

        email: email.toLowerCase().trim(),
        phone,
        website,

        sectors,
        motivation,

        documentPath: req.file?.path ?? null,
      },
    });

      return {
        user,
        application,
      };
    });

    res.status(201).json({
      success: true,
      application: result.application,
    });

  } catch (error) {
  console.error("CREATE INSTITUTION ERROR:");
  console.error(error);

  res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Create failed",
  });
}
};

// GET ALL
export const getApplications = async (
  req: Request,
  res: Response
) => {
  try {
    const applications =
      await prisma.institutionApplication.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    res.json({
      success: true,
      applications,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Get failed",
    });
  }
};

// GET ONE
export const getApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const application =
      await prisma.institutionApplication.findUnique({
        where: {
          id: String(req.params.id),
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error",
    });
  }
};

// APPROVE
export const approveApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const application =
      await prisma.institutionApplication.update({
        where: {
          id: String(req.params.id),
        },
        data: {
          status: "APPROVED",
        },
      });

    await prisma.user.update({
      where: {
        email: application.email,
      },
      data: {
        isActive: true,
        isVerified: true,
      },
    });

    res.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Approve failed",
    });
  }
};

// REJECT
export const rejectApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const application =
      await prisma.institutionApplication.update({
        where: {
          id: String(req.params.id),
        },
        data: {
          status: "REJECTED",
        },
      });

    await prisma.user.update({
      where: {
        email: application.email,
      },
      data: {
        isActive: false,
      },
    });

    res.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Reject failed",
    });
  }
};