import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type SessionToken = {
  role?: "USER" | "ADMIN";
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

  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
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
