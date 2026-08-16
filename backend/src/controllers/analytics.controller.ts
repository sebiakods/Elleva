import { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import type { AnalyticsPeriod } from "../services/analytics.service";

function handleError(res: Response, err: unknown) {
  const anyErr = err as { statusCode?: number; message?: string };
  const status = anyErr.statusCode ?? 500;
  return res.status(status).json({
    success: false,
    message: anyErr.message ?? "Internal server error",
  });
}

export async function getInstitutionAnalytics(req: Request, res: Response) {
  try {
    const requested = req.query.period as string | undefined;
    const allowed: AnalyticsPeriod[] = ["3m", "6m", "12m"];
    const period: AnalyticsPeriod = allowed.includes(requested as AnalyticsPeriod)
      ? (requested as AnalyticsPeriod)
      : "6m";

    const data = await analyticsService.getInstitutionAnalytics(req.user!.id, period);

    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET INSTITUTION ANALYTICS ERROR:", err);
    return handleError(res, err);
  }
}