
"use client";

import { useEffect, useState } from "react";
import authService from "../services/auth";

export type CurrentUser = {
  id: string;
  role: string;
  name?: string;
  email?: string;
};

function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * FIX (round 3): the previous version of this hook gated "loading" on a
 * GET /auth/me network call. If that endpoint doesn't exist yet on the
 * backend, or errors for any reason, the hook could resolve to a logged-out
 * state even for a genuinely authenticated user — which is exactly the
 * "Please log in" bug that kept appearing.
 *
 * This version uses ONLY the mechanism your app already relies on
 * elsewhere and that is proven to work (services/auth.ts):
 *   - authService.getUser()  -> reads localStorage["user"], set at login
 *   - authService.getToken() -> reads localStorage["accessToken"]
 *
 * Resolution is synchronous and has zero network dependency:
 *   1. If localStorage["user"] has a valid id, use it. Done.
 *   2. Otherwise, if a token exists, decode its payload for an id/role.
 *   3. Only if neither exists do we report "logged out".
 *
 * A background call to /auth/me is still attempted to pick up fresher
 * data (e.g. role changes), but it can only ever IMPROVE the resolved
 * user — a failed or missing /auth/me endpoint can no longer force a
 * false "logged out" state.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // 1. Cached user object from login/register (services/auth.ts).
    const cached = authService.getUser();
    if (cached && cached.id) {
      setUser({
        id: String(cached.id),
        role: cached.role,
        name: cached.name,
        email: cached.email,
      });
      setLoading(false);
    } else {
      // 2. Fall back to decoding the JWT itself.
      const token = authService.getToken();
      if (token) {
        const payload = decodeJwtPayload(token);
        const expired = payload?.exp && Date.now() >= payload.exp * 1000;
        const id =
          payload?.id ?? payload?.userId ?? payload?.sub ?? payload?.user?.id;

        if (payload && !expired && id) {
          setUser({
            id: String(id),
            role: payload.role ?? payload.user?.role ?? "",
            name: payload.name,
            email: payload.email,
          });
        } else {
          setUser(null);
        }
      } else {
        // 3. Nothing at all — genuinely logged out.
        setUser(null);
      }
      setLoading(false);
    }

    // Best-effort background refresh. Never clears an already-resolved user.
    authService
      .getCurrentUser()
      .then((fresh) => {
        if (fresh && fresh.id) {
          setUser({
            id: String(fresh.id),
            role: fresh.role,
            name: fresh.name,
            email: fresh.email,
          });
        }
      })
      .catch((err) => {
        console.warn(
          "useCurrentUser: background /auth/me refresh failed (non-fatal, ignored):",
          err
        );
      });
  }, []);

  return { user, loading };
}