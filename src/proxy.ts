import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAuthenticatedRedirect, getAuthRedirect } from "@/lib/redirects";

type SessionToken = {
  role?: "USER" | "ADMIN";
  accountType?: "CLIENT" | "PROVIDER";
};

const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getSessionToken(request);
  const isAuthenticated = Boolean(token);
  const isAdmin = token?.role === "ADMIN";
  const accountType = token?.accountType === "PROVIDER" ? "PROVIDER" : "CLIENT";
  const currentPath = `${pathname}${request.nextUrl.search}`;

  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL(getAuthenticatedRedirect(accountType), request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(getAuthRedirect(currentPath), request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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

async function getSessionToken(request: NextRequest) {
  try {
    return (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) as SessionToken | null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
