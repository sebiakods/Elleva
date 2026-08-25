import { Router } from "express";

import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from "../controllers/notifications.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * GET /api/notifications
 */
router.get(
  "/",
  getUserNotifications
);

/**
 * GET /api/notifications/unread-count
 */
router.get(
  "/unread-count",
  getUnreadNotificationsCount
);

/**
 * PATCH /api/notifications/read-all
 */
router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

/**
 * PATCH /api/notifications/:id/read
 */
router.patch(
  "/:id/read",
  markNotificationAsRead
);

/**
 * DELETE /api/notifications/:id
 */
router.delete(
  "/:id",
  removeNotification
);

export default router;