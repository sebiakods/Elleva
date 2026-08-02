import { Response } from "express";
import * as svc from "../services/notifications.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest } from "../types";

export async function listNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const unreadOnly = req.query.unreadOnly === "true";
    const { notifications, total, unreadCount } = await svc.listNotifications(
      req.user!.id, { skip, limit, unreadOnly }
    );
    R.ok(res, { ...paginate(notifications, total, { page, limit, skip }), unreadCount });
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const notif = await svc.markAsRead(String(req.params.id), req.user!.id);
    R.ok(res, notif);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") return void R.notFound(res);
      if (err.message === "FORBIDDEN") return void R.forbidden(res);
    }
    R.serverError(res);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await svc.markAllAsRead(req.user!.id);
    R.ok(res, result, "Toutes les notifications marquées comme lues");
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await svc.deleteNotification(String(req.params.id), req.user!.id);
    R.noContent(res);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") return void R.notFound(res);
      if (err.message === "FORBIDDEN") return void R.forbidden(res);
    }
    R.serverError(res);
  }
}