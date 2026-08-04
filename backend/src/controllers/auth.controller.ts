import { Request, Response } from "express";
import { Role } from "../types";
import * as authService from "../services/auth.service";
import * as R from "../utils/response";
import { AuthenticatedRequest } from "../types";

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role: Role;
    };

    const result = await authService.register({ email, password, name, role });

    // Send refresh token as httpOnly cookie
    setRefreshCookie(res, result.refreshToken);

    R.created(res, { user: result.user, accessToken: result.accessToken }, "Compte créé avec succès");
  } catch (err: unknown) {
    console.error("REGISTER ERROR:", err);
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      R.conflict(res, "Cette adresse email est déjà utilisée");
    } else {
      R.serverError(res);
    }
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const result = await authService.login({ email, password });

    setRefreshCookie(res, result.refreshToken);

    R.ok(res, { user: result.user, accessToken: result.accessToken }, "Connexion réussie");
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "INVALID_CREDENTIALS")
        return void R.unauthorized(res, "Email ou mot de passe incorrect");
      if (err.message === "ACCOUNT_DISABLED")
        return void R.forbidden(res, "Ce compte est désactivé");
    }
    R.serverError(res);
  }
}

// ─── POST /api/auth/refresh ──────────────────────────────────────────────────
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Accept token from cookie (browser) OR from body (Postman/curl/mobile)
    const rawToken: string | undefined =
      req.cookies?.refreshToken ?? req.body?.refreshToken;

    if (!rawToken) {
      R.badRequest(res, "Refresh token manquant");
      return;
    }

    const tokens = await authService.refresh(rawToken);

    setRefreshCookie(res, tokens.refreshToken);

    R.ok(res, { accessToken: tokens.accessToken }, "Token renouvelé");
  } catch {
    R.unauthorized(res, "Refresh token invalide ou expiré");
  }
}

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user) await authService.logout(req.user.id);

    // Clear the cookie regardless
    res.clearCookie("refreshToken", cookieOptions());

    R.ok(res, null, "Déconnexion réussie");
  } catch (err) {
    console.error(err);
    R.serverError(res);  }
}

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await authService.me(req.user!.id);
    R.ok(res, user);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND")
      return void R.notFound(res, "Utilisateur introuvable");
    R.serverError(res);
  }
}

// ─── Cookie helper ───────────────────────────────────────────────────────────
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/api/auth",
  };
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, cookieOptions());
}