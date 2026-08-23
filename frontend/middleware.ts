import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: this calls the backend DIRECTLY (server-to-server), so CORS
// and the /api rewrite proxy are irrelevant here — this code runs on
// Vercel's server, not in the user's browser.
const BACKEND_URL = "https://ellevadz-backend.onrender.com";

// Map each protected route prefix to the role(s) allowed to access it.
const ROUTE_ROLES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/expert": ["EXPERT"],
  "/institution": ["INSTITUTION"],
  "/dashboard": ["ENTREPRENEUR"],
};

function matchRoute(pathname: string): string[] | null {
  for (const prefix of Object.keys(ROUTE_ROLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return ROUTE_ROLES[prefix];
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const allowedRoles = matchRoute(pathname);

  // Not a protected route — let it through untouched.
  if (!allowedRoles) {
    return NextResponse.next();
  }

  const cookieHeader = req.headers.get("cookie") ?? "";

  // No cookies at all -> definitely not authenticated.
  if (!cookieHeader) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const body = await res.json();
    const role: string | undefined = body?.data?.role;

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    // Backend unreachable / any error -> fail closed, not open.
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/expert/:path*", "/institution/:path*", "/dashboard/:path*"],
};

