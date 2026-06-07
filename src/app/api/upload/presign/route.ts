import { NextResponse, type NextRequest } from "next/server";

import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { validateCSRFToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeFilename, sanitizeInt, sanitizeUrlParam } from "@/lib/sanitize";
import {
  getPublicUrl,
  type UploadFolder,
} from "@/lib/uploadImage";
import { createUploadProxyToken } from "@/lib/upload-proxy-token";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ALLOWED_FOLDERS: UploadFolder[] = ["avatars", "portfolio", "listings"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

type PresignRequestBody = {
  fileName?: unknown;
  contentType?: unknown;
  fileSize?: unknown;
  folder?: unknown;
};

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const csrfToken = req.headers.get("x-csrf-token");

  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return NextResponse.json({ error: "طلب غير مصرح به" }, { status: 403 });
  }

  const uploadLimit = await rateLimiters.upload(session.user.id);

  if (!uploadLimit.success) {
    return NextResponse.json({ error: "تم تجاوز حد الرفع، حاول لاحقاً" }, { status: 429 });
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

  const body = (await req.json()) as PresignRequestBody;
  const rawFileName = body.fileName;
  const fileName = sanitizeFilename(rawFileName);
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const fileSize = sanitizeInt(body.fileSize, 0, MAX_SIZE_BYTES + 1);
  const folder = sanitizeUrlParam(body.folder) as UploadFolder;

  if (typeof rawFileName !== "string" || rawFileName.trim().length === 0 || fileName.length === 0) {
    return NextResponse.json({ error: "اسم الملف مطلوب" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(contentType as never)) {
    return NextResponse.json(
      { error: "نوع الملف غير مدعوم، يسمح بـ JPG و PNG و WebP فقط" },
      { status: 400 },
    );
  }

  if (typeof body.fileSize !== "number" || !Number.isFinite(body.fileSize)) {
    return NextResponse.json({ error: "حجم الملف غير صحيح" }, { status: 400 });
  }

  if (fileSize > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح (2MB)" }, { status: 400 });
  }

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "مجلد الرفع غير صحيح" }, { status: 400 });
  }

  try {
    const key = generateSafeImageKey(folder, session.user.id, contentType);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const token = createUploadProxyToken({
      key,
      userId: session.user.id,
      contentType,
      expiresAt,
    });
    const presignedUrl = `/api/upload/proxy?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(
      contentType,
    )}&expiresAt=${expiresAt}&token=${token}`;
    const publicUrl = getPublicUrl(key);
    logAudit("UPLOAD_FILE", {
      userId: session.user.id,
      entityType: "R2Object",
      entityId: key,
      metadata: { folder, contentType, fileSize },
    });

    return NextResponse.json({ presignedUrl, publicUrl, key });
  } catch {
    return NextResponse.json({ error: "إعدادات رفع الصور غير مكتملة" }, { status: 500 });
  }
}

function generateSafeImageKey(folder: UploadFolder, userId: string, contentType: string) {
  const extensionByType: Record<(typeof ALLOWED_TYPES)[number], string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[contentType as (typeof ALLOWED_TYPES)[number]];

  return `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}
