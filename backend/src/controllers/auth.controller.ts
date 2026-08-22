import { Request, Response } from "express";
import { Role, AuthenticatedRequest } from "../types";
import * as authService from "../services/auth.service";
import { verifyRefreshToken } from "../services/token.service";
import * as R from "../utils/response";

const isProd = process.env.NODE_ENV === "production";

// IMPORTANT: sameSite:"none" REQUIRES secure:true or the browser silently
// drops the cookie. On localhost (http, non-prod) that combo always failed,
// which is why /auth/me kept returning 401 even right after login.
const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(
    "accessToken",
    accessToken,
    accessCookieOptions
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );
}
function clearAuthCookies(res: Response): void {
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
  };

  // Current cookies: Path=/
  res.clearCookie("accessToken", { ...baseOptions, path: "/" });
  res.clearCookie("refreshToken", { ...baseOptions, path: "/" });

  // Belt-and-suspenders: also clear any stale cookies set under older
  // path/sameSite combos so leftover browser state can't linger.
  res.clearCookie("refreshToken", { ...baseOptions, path: "/api/auth" });
  res.clearCookie("refreshToken", { ...baseOptions, path: "/api" });
}
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response
): Promise<void> {
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
      return;
    }

    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

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
        R.unauthorized(
          res,
          "Email ou mot de passe incorrect"
        );
        return;
      }

      if (err.message === "ACCOUNT_DISABLED") {
        R.forbidden(
          res,
          "Ce compte est désactivé"
        );
        return;
      }
    }

    R.serverError(res);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────

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
  } catch (err) {
    console.error("REFRESH ERROR:", err);

    clearAuthCookies(res);

    R.unauthorized(
      res,
      "Refresh token invalide ou expiré"
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // NOTE: the "/logout" route has no verifyToken middleware, so
    // req.user is never populated — revoking by req.user.id was always a
    // no-op. Read the userId straight out of the refresh token instead,
    // which also lets logout succeed even if the access token expired.
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      try {
        const payload = verifyRefreshToken(rawRefreshToken);
        await authService.logout(payload.sub);
      } catch {
        // token already invalid/expired — nothing to revoke, just clear cookies
      }
    }

    clearAuthCookies(res);

    R.ok(res, null, "Déconnexion réussie");
  } catch (err) {
    console.error("LOGOUT ERROR:", err);

    clearAuthCookies(res);

    R.serverError(res);
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user?.id) {
      R.unauthorized(
        res,
        "Authentification requise"
      );
      return;
    }

    const user =
      await authService.me(req.user.id);

    R.ok(res, user);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message === "USER_NOT_FOUND"
    ) {
      R.notFound(
        res,
        "Utilisateur introuvable"
      );
      return;
    }

    R.serverError(res);
  }
}