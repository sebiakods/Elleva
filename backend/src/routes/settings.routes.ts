import { Router } from "express";
import {
  getMySettings,
  updateMySettings,
  updatePassword,
  getNotifications,
  updateNotifications,
  getAdminSystemSettings,
  updateAdminSystemSettings,
} from "../controllers/settings.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/* =========================================================
   PERSONAL SETTINGS
========================================================= */

router.get(
  "/me",
  authenticate,
  getMySettings
);

router.put(
  "/me",
  authenticate,
  updateMySettings
);

/* =========================================================
   PASSWORD
========================================================= */

router.put(
  "/password",
  authenticate,
  updatePassword
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

router.get(
  "/notifications",
  authenticate,
  getNotifications
);

router.put(
  "/notifications",
  authenticate,
  updateNotifications
);

/* =========================================================
   ADMIN
========================================================= */

router.get(
  "/system",
  authenticate,
  getAdminSystemSettings
);

router.put(
  "/system",
  authenticate,
  updateAdminSystemSettings
);

export default router;