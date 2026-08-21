import { Request, Response } from "express";
import { Role, AuthenticatedRequest } from "../types";
import * as authService from "../services/auth.service";
import * as R from "../utils/response";

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000,
  path: "/",
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role: Role;
    };

    const result = await authService.register({
      email,
      password,
      name,
      role,
    });

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    R.created(
      res,
      { user: result.user },
      "Compte créé avec succès"
    );
  } catch (err: unknown) {
    console.error("REGISTER ERROR:", err);

    if (
      err instanceof Error &&
      err.message === "EMAIL_TAKEN"
    ) {
      R.conflict(
        res,
        "Cette adresse email est déjà utilisée"
      );
    } else {
      R.serverError(res);
    }
  }
}

// POST /api/auth/login
export async function login(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const result = await authService.login({
      email,
      password,
    });

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    R.ok(
      res,
      { user: result.user },
      "Connexion réussie"
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "INVALID_CREDENTIALS") {
        return void R.unauthorized(
          res,
          "Email ou mot de passe incorrect"
        );
      }

      if (err.message === "ACCOUNT_DISABLED") {
        return void R.forbidden(
          res,
          "Ce compte est désactivé"
        );
      }
    }

    R.serverError(res);
  }
}

// POST /api/auth/refresh
export async function refresh(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (!rawToken) {
      R.unauthorized(
        res,
        "Refresh token manquant"
      );
      return;
    }

    const tokens =
      await authService.refresh(rawToken);

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );

    R.ok(
      res,
      null,
      "Token renouvelé"
    );
  } catch {
    res.clearCookie(
      "accessToken",
      { path: "/" }
    );

    res.clearCookie(
      "refreshToken",
      { path: "/api/auth" }
    );

    R.unauthorized(
      res,
      "Refresh token invalide ou expiré"
    );
  }
}

// POST /api/auth/logout
export async function logout(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (req.user) {
      await authService.logout(req.user.id);
    }

    res.clearCookie(
      "accessToken",
      { path: "/" }
    );

    res.clearCookie(
      "refreshToken",
      { path: "/api/auth" }
    );

    R.ok(
      res,
      null,
      "Déconnexion réussie"
    );
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

// GET /api/auth/me
export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const user =
      await authService.me(req.user!.id);

    R.ok(res, user);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message === "USER_NOT_FOUND"
    ) {
      return void R.notFound(
        res,
        "Utilisateur introuvable"
      );
    }

    R.serverError(res);
  }
}