import { NextResponse, type NextRequest } from "next/server";

import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimitHeaders, rateLimiters } from "@/lib/rateLimit";
import { getPublicUrl, uploadToR2 } from "@/lib/uploadImage";
import { validateUploadProxyToken } from "@/lib/upload-proxy-token";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ALLOWED_PREFIXES = ["avatars/", "portfolio/", "listings/", "payment-proofs/"] as const;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const contentType = url.searchParams.get("contentType") ?? "";
  const expiresAt = Number(url.searchParams.get("expiresAt") ?? "0");
  const token = url.searchParams.get("token") ?? "";

  if (!ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return NextResponse.json({ error: "مسار الرفع غير صالح" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(contentType as never)) {
    return NextResponse.json({ error: "نوع الصورة غير مدعوم" }, { status: 400 });
  }

  if (
    !Number.isFinite(expiresAt) ||
    !validateUploadProxyToken({ key, userId: session.user.id, contentType, expiresAt, token })
  ) {
    return NextResponse.json({ error: "رابط الرفع منتهي أو غير صالح" }, { status: 403 });
  }

  const uploadLimit = await rateLimiters.upload(session.user.id);

  if (!uploadLimit.success) {
    return NextResponse.json(
      { error: "تم تجاوز حد الرفع، حاول لاحقاً" },
      { status: 429, headers: rateLimitHeaders(uploadLimit) },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      isBanned: true,
    },
  });

  if (user?.isBanned) {
    return NextResponse.json({ error: "تم تعليق حسابك" }, { status: 403 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");

  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await req.arrayBuffer());

    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح" }, { status: 400 });
    }

    await uploadToR2({
      key,
      body: buffer,
      contentType,
    });
    logAudit("UPLOAD_FILE", {
      userId: session.user.id,
      entityType: "R2Object",
      entityId: key,
      metadata: { contentType, fileSize: buffer.byteLength, mode: "proxy" },
    });

    return NextResponse.json({
      key,
      publicUrl: getPublicUrl(key),
    });
  } catch {
    return NextResponse.json({ error: "تعذر رفع الصورة، حاول مرة أخرى" }, { status: 500 });
  }
}
