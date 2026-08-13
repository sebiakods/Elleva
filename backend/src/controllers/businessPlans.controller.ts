import { Response } from "express";
import * as svc from "../services/businessPlans.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest } from "../types";

export async function listMyPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plans = await svc.listMyPlans(req.user!.id);
    R.ok(res, plans);
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function getPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plan = await svc.getPlan(String(req.params.id), req.user!.id, req.user!.role);
    R.ok(res, plan);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND")  return void R.notFound(res);
      if (err.message === "FORBIDDEN")  return void R.forbidden(res);
    }
    R.serverError(res);
  }
}

export async function createPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plan = await svc.createPlan(req.user!.id, req.body.title);
    R.created(res, plan, "Business plan créé");
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function updatePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plan = await svc.updatePlan(String(req.params.id), req.user!.id, req.body);
    R.ok(res, plan, "Business plan mis à jour");
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND")  return void R.notFound(res);
      if (err.message === "FORBIDDEN")  return void R.forbidden(res);
      if (err.message === "LOCKED")     return void R.badRequest(res, "Ce plan est approuvé et ne peut plus être modifié");
    }
    R.serverError(res);
  }
}

export async function submitPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plan = await svc.submitPlan(String(req.params.id), req.user!.id);
    R.ok(res, plan, "Business plan soumis pour révision");
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND")          return void R.notFound(res);
      if (err.message === "FORBIDDEN")          return void R.forbidden(res);
      if (err.message === "ALREADY_SUBMITTED")  return void R.badRequest(res, "Ce plan a déjà été soumis");
    }
    R.serverError(res);
  }
}

export async function deletePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await svc.deletePlan(String(req.params.id), req.user!.id);
    R.noContent(res);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND")  return void R.notFound(res);
      if (err.message === "FORBIDDEN")  return void R.forbidden(res);
      if (err.message === "LOCKED")     return void R.badRequest(res, "Un plan approuvé ne peut pas être supprimé");
    }
    R.serverError(res);
  }
}

// ─── Expert review queue ───────────────────────────────────────────────────────
export async function listSubmittedPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const view = req.query.view === "completed" ? "completed" : "pending";
    const { plans, total } = await svc.listSubmittedPlans({
      skip,
      limit,
      view,
      expertId: view === "completed" ? req.user!.id : undefined,
    });
    R.ok(res, paginate(plans, total, { page, limit, skip }));
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function reviewPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { score, notes, status } = req.body as {
      score: number; notes: string; status: "APPROVED" | "REJECTED";
    };
    const plan = await svc.reviewPlan(String(req.params.id), req.user!.id, { score, notes, status });
    R.ok(res, plan, "Révision enregistrée");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND")
      return void R.notFound(res);
    R.serverError(res);
  }
}