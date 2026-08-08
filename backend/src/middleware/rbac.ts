
import { Response, NextFunction } from "express";
import { Role, AuthenticatedRequest } from "../types";
import { forbidden, unauthorized } from "../utils/response";

// ─────────────────────────────────────────────────────────────────────────────
// Normalize role values
// ─────────────────────────────────────────────────────────────────────────────

function normalizeRole(role: unknown): string {
  return String(role ?? "").toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Require specific roles
// ─────────────────────────────────────────────────────────────────────────────

export function requireRoles(...roles: Role[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      unauthorized(res);
      return;
    }

    const userRole = normalizeRole(req.user.role);

    const allowedRoles = roles.map((role) =>
      normalizeRole(role)
    );

    if (!allowedRoles.includes(userRole)) {
      forbidden(
        res,
        `Accès réservé aux rôles : ${roles.join(", ")}`
      );
      return;
    }

    next();
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience helpers
// ─────────────────────────────────────────────────────────────────────────────

export const adminOnly = requireRoles(
  Role.ADMIN
);

export const entrepreneurOnly = requireRoles(
  Role.ENTREPRENEUR
);

export const expertOnly = requireRoles(
  Role.EXPERT
);

export const institutionOnly = requireRoles(
  Role.INSTITUTION
);

export const allRoles = requireRoles(
  Role.ADMIN,
  Role.ENTREPRENEUR,
  Role.EXPERT,
  Role.INSTITUTION
);


export const expertOrAdmin = requireRoles(
  Role.EXPERT,
  Role.ADMIN
);


export const institutionOrAdmin = requireRoles(
  Role.INSTITUTION,
  Role.ADMIN
);

export const entrepreneurOrAdmin = requireRoles(
  Role.ENTREPRENEUR,
  Role.ADMIN
);

// ─────────────────────────────────────────────────────────────────────────────
// Owner or admin check
// ─────────────────────────────────────────────────────────────────────────────

export function checkOwnerOrAdmin(
  user: AuthenticatedRequest["user"],
  ownerId: string,
  res: Response
): boolean {
  if (!user) {
    unauthorized(res);
    return false;
  }

  const userRole = normalizeRole(user.role);

  if (
    userRole === normalizeRole(Role.ADMIN) ||
    user.id === ownerId
  ) {
    return true;
  }

  forbidden(
    res,
    "Vous n'avez pas accès à cette ressource"
  );

  return false;
}