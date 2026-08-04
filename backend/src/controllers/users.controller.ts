import { Response } from "express";
import * as svc from "../services/users.service";
import * as R from "../utils/response";
import { getPagination, paginate } from "../utils/pagination";
import { AuthenticatedRequest } from "../types";

// ─────────────────────────────────────────────
// Own profile
// ─────────────────────────────────────────────

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const user = await svc.getProfile(req.user!.id);
    R.ok(res, user);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return void R.notFound(res);
    }

    R.serverError(res);
  }
}

export async function updateMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const updated = await svc.updateProfile(req.user!.id, req.body);
    R.ok(res, updated, "Profil mis à jour");
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

// ─────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { page, limit, skip } = getPagination(req);
    const { role, search } = req.query as Record<string, string>;

    const { users, total } = await svc.listUsers({
      skip,
      limit,
      role,
      search,
    });

    R.ok(res, paginate(users, total, { page, limit, skip }));
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function getUserById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const user = await svc.getUserById(String(req.params.id));
    R.ok(res, user);
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return void R.notFound(res);
    }

    R.serverError(res);
  }
}

export async function suspendUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const result = await svc.setUserActive(String(req.params.id), false);
    R.ok(res, result, "Compte suspendu");
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function activateUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const result = await svc.setUserActive(String(req.params.id), true);
    R.ok(res, result, "Compte réactivé");
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    await svc.deleteUser(String(req.params.id));
    R.ok(res, null, "Utilisateur supprimé");
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return void R.notFound(res);
    }

    R.serverError(res);
  }
}