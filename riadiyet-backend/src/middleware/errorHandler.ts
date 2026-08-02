import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = env.NODE_ENV === "development";

  console.error("[ErrorHandler]", err.message, isDev ? err.stack : "");

  res.status(500).json({
    success: false,
    error: "Erreur serveur interne",
    ...(isDev && { details: err.message, stack: err.stack }),
  });
}