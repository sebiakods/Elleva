import { Request, Response } from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notifications.service";


export async function getUserNotifications(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const unreadOnly =
      req.query.unreadOnly === "true";

    const limitParam =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 50;

    const limit = Number.isFinite(limitParam)
      ? limitParam
      : 50;

    const notifications =
      await getNotifications(
        req.user.id,
        {
          unreadOnly,
          limit,
        }
      );

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "GET /notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
}


export async function getUnreadNotificationsCount(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const count =
      await getUnreadCount(req.user.id);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "GET /notifications/unread-count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch unread notification count",
    });
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const notificationId = Array.isArray(
      req.params.id
    )
      ? req.params.id[0]
      : req.params.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message:
          "Notification ID is required",
      });
    }

    const result =
      await markAsRead(
        notificationId,
        req.user.id
      );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "PATCH /notifications/:id/read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    });
  }
}

/**
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsRead(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const result =
      await markAllAsRead(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
      count: result.count,
    });
  } catch (error) {
    console.error(
      "PATCH /notifications/read-all error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark all notifications as read",
    });
  }
}


export async function removeNotification(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    const notificationId = Array.isArray(
      req.params.id
    )
      ? req.params.id[0]
      : req.params.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message:
          "Notification ID is required",
      });
    }

    const result =
      await deleteNotification(
        notificationId,
        req.user.id
      );

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted",
    });
  } catch (error) {
    console.error(
      "DELETE /notifications/:id error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notification",
    });
  }
}