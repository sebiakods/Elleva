import { Response } from "express";
import * as svc from "../services/messages.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest } from "../types";

export async function getThreads(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const threads = await svc.getThreads(req.user!.id);
    R.ok(res, threads);
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const { messages, total } = await svc.getConversation(
      req.user!.id,
      String(req.params.partnerId),
      { skip, limit }
    );
    R.ok(res, paginate(messages, total, { page, limit, skip }));
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { receiverId, content } = req.body as { receiverId: string; content: string };
    const message = await svc.sendMessage(req.user!.id, receiverId, content);
    R.created(res, message);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "RECEIVER_NOT_FOUND")
      return void R.notFound(res, "Destinataire introuvable");
    R.serverError(res);
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const count = await svc.getUnreadCount(req.user!.id);
    R.ok(res, { unreadCount: count });
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}