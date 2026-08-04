import { Response } from "express";
import * as svc from "../services/programs.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest } from "../types";

export async function listPrograms(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const { category, search } = req.query as Record<string, string>;

    const isAdmin = req.user?.role === "ADMIN";

    const { programs, total } = await svc.listPrograms({
      skip,
      limit,
      category,
      search,
      publishedOnly: !isAdmin,
    });

    R.ok(res, paginate(programs, total, { page, limit, skip }));
  } catch (err) {
    console.error("listPrograms:", err);
    R.serverError(res);
  }
}

export async function getProgram(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const slug = String(req.params.slug);

    const program = await svc.getProgramBySlug(slug);

    R.ok(res, program);
  } catch (err) {
    console.error("getProgram:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return void R.notFound(res, "Programme introuvable");
    }

    R.serverError(res);
  }
}

export async function createProgram(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const institutionProfileId = req.body._institutionProfileId;

    const program = await svc.createProgram(
      institutionProfileId,
      req.body
    );

    R.created(res, program, "Programme créé");
  } catch (err) {
    console.error("createProgram:", err);

    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return void R.conflict(res, "Ce slug est déjà utilisé");
    }

    R.serverError(res);
  }
}

export async function updateProgram(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const institutionProfileId = req.body._institutionProfileId;
    const id = String(req.params.id);

    const program = await svc.updateProgram(
      id,
      institutionProfileId,
      req.body
    );

    R.ok(res, program, "Programme mis à jour");
  } catch (err) {
    console.error("updateProgram:", err);

    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return void R.notFound(res, "Programme introuvable");
      }

      if (err.message === "FORBIDDEN") {
        return void R.forbidden(res);
      }
    }

    R.serverError(res);
  }
}

export async function deleteProgram(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const institutionProfileId = req.body._institutionProfileId;
    const id = String(req.params.id);

    console.log("DELETE PROGRAM");
    console.log("ID:", id);
    console.log("Institution:", institutionProfileId);

    await svc.deleteProgram(
      id,
      institutionProfileId
    );

    console.log("DELETE DONE");

    R.noContent(res);
  } catch (err) {
    console.error("deleteProgram ERROR:", err);

    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return void R.notFound(res, "Programme introuvable");
      }

      if (err.message === "FORBIDDEN") {
        return void R.forbidden(res);
      }
    }

    R.serverError(res);
  }
}

export async function getFavorites(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const favorites = await svc.getUserFavorites(req.user!.id);

    R.ok(res, favorites);
  } catch (err) {
    console.error("getFavorites:", err);
    R.serverError(res);
  }
}

export async function toggleFavorite(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const programId = String(req.params.programId);

    const result = await svc.toggleFavorite(
      req.user!.id,
      programId
    );

    R.ok(res, result);
  } catch (err) {
    console.error("toggleFavorite:", err);
    R.serverError(res);
  }
}