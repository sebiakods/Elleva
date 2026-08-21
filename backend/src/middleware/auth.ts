import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import { unauthorized } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token =
    req.cookies?.accessToken;

  if (!token) {
    unauthorized(
      res,
      "Token d'accès manquant"
    );
    return;
  }

  try {
    const payload =
      verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };

    next();
  } catch (err: unknown) {
    const message =
      err instanceof Error &&
      err.name === "TokenExpiredError"
        ? "Token expiré"
        : "Token invalide";

    unauthorized(res, message);
  }
}

export function optionalToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const token =
    req.cookies?.accessToken;

  if (token) {
    try {
      const payload =
        verifyAccessToken(token);

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
    } catch {
      // Ignore invalid token
    }
  }

  next();
}