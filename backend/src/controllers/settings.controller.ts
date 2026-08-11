import { Request, Response } from "express";
import * as settingsService from "../services/settings.service";

/*
  Your auth middleware should attach the authenticated user
  to req.user.

  If your existing auth middleware uses a different type,
  this small helper keeps the controller simple.
*/

function getUserId(req: Request): string {
  const user = (req as any).user;

  if (!user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return user.id;
}

/* =========================================================
   PERSONAL SETTINGS
========================================================= */

export async function getMySettings(
  req: Request,
  res: Response
) {
  try {
    const userId = getUserId(req);

    const settings = await settingsService.getMySettings(
      userId
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("GET SETTINGS ERROR:", error);

    return res.status(
      error.message === "UNAUTHORIZED" ? 401 : 500
    ).json({
      success: false,
      message:
        error.message === "UNAUTHORIZED"
          ? "Non autorisé"
          : "Erreur lors du chargement des paramètres",
    });
  }
}

export async function updateMySettings(
  req: Request,
  res: Response
) {
  try {
    const userId = getUserId(req);

    const settings = await settingsService.updateMySettings(
      userId,
      req.body
    );

    return res.json({
      success: true,
      message: "Paramètres enregistrés",
      data: settings,
    });
  } catch (error: any) {
    console.error("UPDATE SETTINGS ERROR:", error);

    return res.status(
      error.message === "UNAUTHORIZED" ? 401 : 500
    ).json({
      success: false,
      message:
        error.message === "UNAUTHORIZED"
          ? "Non autorisé"
          : "Erreur lors de la sauvegarde des paramètres",
    });
  }
}

/* =========================================================
   PASSWORD
========================================================= */

export async function updatePassword(
  req: Request,
  res: Response
) {
  try {
    const userId = getUserId(req);

    const {
      currentPassword,
      newPassword,
    } = req.body;

    await settingsService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error: any) {
    console.error("CHANGE PASSWORD ERROR:", error);

    const statusMap: Record<string, number> = {
      UNAUTHORIZED: 401,
      USER_NOT_FOUND: 404,
      CURRENT_AND_NEW_PASSWORD_REQUIRED: 400,
      PASSWORD_TOO_SHORT: 400,
      INVALID_CURRENT_PASSWORD: 400,
    };

    return res.status(
      statusMap[error.message] ?? 500
    ).json({
      success: false,
      message:
        error.message === "INVALID_CURRENT_PASSWORD"
          ? "Mot de passe actuel incorrect"
          : error.message === "PASSWORD_TOO_SHORT"
          ? "Le nouveau mot de passe doit contenir au moins 8 caractères"
          : error.message ===
            "CURRENT_AND_NEW_PASSWORD_REQUIRED"
          ? "Les deux mots de passe sont obligatoires"
          : "Erreur lors du changement du mot de passe",
    });
  }
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export async function getNotifications(
  req: Request,
  res: Response
) {
  try {
    const userId = getUserId(req);

    const settings =
      await settingsService.getNotificationSettings(userId);

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error(
      "GET NOTIFICATION SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erreur lors du chargement des notifications",
    });
  }
}

export async function updateNotifications(
  req: Request,
  res: Response
) {
  try {
    const userId = getUserId(req);

    const settings =
      await settingsService.updateNotificationSettings(
        userId,
        req.body
      );

    return res.json({
      success: true,
      message: "Préférences de notification enregistrées",
      data: settings.value,
    });
  } catch (error) {
    console.error(
      "UPDATE NOTIFICATION SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erreur lors de la sauvegarde des notifications",
    });
  }
}

/* =========================================================
   ADMIN
========================================================= */

function requireAdmin(req: Request) {
  const user = (req as any).user;

  if (!user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user.id;
}

export async function getAdminSystemSettings(
  req: Request,
  res: Response
) {
  try {
    requireAdmin(req);

    const settings =
      await settingsService.getSystemSettings();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error(
      "GET ADMIN SETTINGS ERROR:",
      error
    );

    return res.status(
      error.message === "FORBIDDEN" ? 403 : 401
    ).json({
      success: false,
      message:
        error.message === "FORBIDDEN"
          ? "Accès administrateur requis"
          : "Non autorisé",
    });
  }
}

export async function updateAdminSystemSettings(
  req: Request,
  res: Response
) {
  try {
    requireAdmin(req);

    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message:
          "Le format doit être un tableau de paramètres",
      });
    }

    const settings =
      await settingsService.updateSystemSettings(
        req.body
      );

    return res.json({
      success: true,
      message: "Paramètres système enregistrés",
      data: settings,
    });
  } catch (error: any) {
    console.error(
      "UPDATE ADMIN SETTINGS ERROR:",
      error
    );

    return res.status(
      error.message === "FORBIDDEN" ? 403 : 401
    ).json({
      success: false,
      message:
        error.message === "FORBIDDEN"
          ? "Accès administrateur requis"
          : "Non autorisé",
    });
  }
}