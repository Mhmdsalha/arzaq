import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAuthRedirect } from "@/lib/redirects";

type SessionToken = {
  role?: "USER" | "ADMIN";
  accountType?: "CLIENT" | "PROVIDER";
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") && isMutatingRequest(request) && !isAllowedApiOrigin(request)) {
    return NextResponse.json({ error: "طلب غير مصرح به" }, { status: 403 });
  }

  const token = await getSessionToken(request);
  const isAuthenticated = Boolean(token);
  const isAdmin = token?.role === "ADMIN";
  const accountType = token?.accountType === "PROVIDER" ? "PROVIDER" : "CLIENT";
  const currentPath = `${pathname}${request.nextUrl.search}`;

  if (pathname === "/admin/login") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(currentPath)}`, request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login?error=admin_required", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL(getAuthRedirect(currentPath), request.url));
  }

  if (isAuthenticated && accountType === "CLIENT" && pathname === "/dashboard/offers") {
    return NextResponse.redirect(new URL("/dashboard?error=client_cannot_offer", request.url));
  }

  if (isAuthenticated && accountType === "PROVIDER" && pathname.startsWith("/dashboard/jobs")) {
    return NextResponse.redirect(new URL("/dashboard?error=provider_cannot_post", request.url));
  }

  return NextResponse.next();
}

function isMutatingRequest(request: NextRequest) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
}

function isAllowedApiOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : null;
    const requestHost = request.headers.get("host");

    return (
      originUrl.host === requestHost ||
      Boolean(siteUrl && originUrl.origin === siteUrl.origin)
    );
  } catch {
    return false;
  }
}

async function getSessionToken(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  try {
    for (const cookieName of cookieNames) {
      const token = (await getToken({
        req: request,
        secret,
        cookieName,
      })) as SessionToken | null;

      if (token) {
        return token;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
