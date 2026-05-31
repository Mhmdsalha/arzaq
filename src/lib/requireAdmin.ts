import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

function notFoundJson() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function validateAdminRequest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return {
      authorized: false,
      response: notFoundJson(),
      session: null,
    };
  }

  const allowedIps = (process.env.ADMIN_ALLOWED_IPS ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (allowedIps.length > 0) {
    const headersList = await headers();
    const clientIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? headersList.get("x-real-ip")
      ?? "unknown";

    if (!allowedIps.includes(clientIp)) {
      return {
        authorized: false,
        response: notFoundJson(),
        session: null,
      };
    }
  }

  return {
    authorized: true,
    response: null,
    session,
  };
}
