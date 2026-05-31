import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Redis } from "@upstash/redis";

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
  const secretAdminPrefix = getSecretAdminPrefix();
  const isSecretAdminPath = Boolean(
    secretAdminPrefix && (pathname === secretAdminPrefix || pathname.startsWith(`${secretAdminPrefix}/`)),
  );

  if (isSecretAdminPath) {
    if (await isAdminBlocked(request)) {
      return notFoundResponse(request);
    }

    if (!isAllowedAdminIp(request) || !isAdmin) {
      void logAdminAccessAttempt(request);
      return notFoundResponse(request);
    }

    return NextResponse.rewrite(
      new URL(`/admin${pathname.slice(secretAdminPrefix!.length)}${request.nextUrl.search}`, request.url),
    );
  }

  if (pathname.startsWith("/admin")) {
    if (await isAdminBlocked(request)) {
      return notFoundResponse(request);
    }

    if (!isAllowedAdminIp(request) || !isAdmin) {
      void logAdminAccessAttempt(request);
      return notFoundResponse(request);
    }

    if (secretAdminPrefix) {
      return notFoundResponse(request);
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

function notFoundResponse(request: NextRequest) {
  return NextResponse.rewrite(new URL("/not-found", request.url), {
    status: 404,
  });
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

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

function getAllowedAdminIps() {
  return (process.env.ADMIN_ALLOWED_IPS ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function getSecretAdminPrefix() {
  const secretPath = process.env.ADMIN_SECRET_PATH?.trim();

  return secretPath ? `/control-${secretPath}` : null;
}

function isAllowedAdminIp(request: NextRequest) {
  const allowedIps = getAllowedAdminIps();

  if (allowedIps.length === 0) {
    return true;
  }

  return allowedIps.includes(getClientIp(request));
}

function getAdminRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

async function isAdminBlocked(request: NextRequest) {
  const redis = getAdminRedis();

  if (!redis) {
    return false;
  }

  const blocked = await redis.get(`arzaq:admin-blocked:${getClientIp(request)}`).catch(() => null);

  return blocked === "1";
}

async function logAdminAccessAttempt(request: NextRequest) {
  const redis = getAdminRedis();

  if (!redis) {
    return;
  }

  const clientIp = getClientIp(request);
  const attemptKey = `arzaq:admin-attempt:${clientIp}`;
  const attempts = await redis.incr(attemptKey).catch(() => 0);

  await redis.expire(attemptKey, 60 * 60).catch(() => undefined);

  if (Number(attempts) >= 10) {
    await redis.setex(`arzaq:admin-blocked:${clientIp}`, 24 * 60 * 60, "1").catch(() => undefined);
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
