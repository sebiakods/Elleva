import { Request, Response } from "express";
import * as overviewService from "../services/overview.service";

function handleError(res: Response, err: unknown) {
  const anyErr = err as { statusCode?: number; message?: string };
  const status = anyErr.statusCode ?? 500;
  return res.status(status).json({
    success: false,
    message: anyErr.message ?? "Internal server error",
  });
}

export async function getInstitutionOverview(req: Request, res: Response) {
  try {
    const data = await overviewService.getInstitutionOverview(req.user!.id);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET INSTITUTION OVERVIEW ERROR:", err);
    return handleError(res, err);
  }
}
export async function getAdminOverview(req: Request, res: Response) {
  try {
    const data = await overviewService.getAdminOverview();
    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET ADMIN OVERVIEW ERROR:", err);
    return handleError(res, err);
  }
}