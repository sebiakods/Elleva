import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import { unauthorized } from "../utils/response";
import { AuthenticatedRequest } from "../types";

/**
 * Verify Bearer access token
 */
export function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {

  const authHeader = req.headers.authorization;

  console.log("========== AUTH DEBUG ==========");
  console.log("Authorization:", authHeader);
  console.log("================================");

  if (!authHeader?.startsWith("Bearer ")) {
    unauthorized(res, "Token d'accès manquant");
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);

    console.log("JWT PAYLOAD:", payload);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };

    console.log("REQ.USER:", req.user);

    next();

  } catch (err: unknown) {

    console.error("JWT ERROR:", err);

    const message =
      err instanceof Error && err.name === "TokenExpiredError"
        ? "Token expiré"
        : "Token invalide";

    unauthorized(res, message);
  }
}


/**
 * Optional authentication
 */
export function optionalToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {

    try {

      const payload = verifyAccessToken(
        authHeader.substring(7)
      );

      console.log("OPTIONAL JWT:", payload);

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