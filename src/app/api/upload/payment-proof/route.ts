import { NextResponse, type NextRequest } from "next/server";

import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { validateCSRFToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { rateLimitHeaders, rateLimiters } from "@/lib/rateLimit";
import { getPublicUrl, uploadToR2 } from "@/lib/uploadImage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PAYMENT_PROOF_BYTES = 1024 * 1024;

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

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "إشعار الدفع مطلوب" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "نوع الصورة غير مدعوم، يُسمح بـ JPG و PNG و WebP فقط" },
      { status: 400 },
    );
  }

  if (file.size > MAX_PAYMENT_PROOF_BYTES) {
    return NextResponse.json(
      { error: "حجم إشعار الدفع بعد الضغط يجب ألا يتجاوز 1MB" },
      { status: 400 },
    );
  }

  try {
    const key = generatePaymentProofKey(session.user.id, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
      cacheControl: "private, max-age=31536000",
    });
    logAudit("UPLOAD_FILE", {
      userId: session.user.id,
      entityType: "R2Object",
      entityId: key,
      metadata: { folder: "payment-proofs", contentType: file.type, fileSize: file.size },
    });

    return NextResponse.json({
      key,
      publicUrl: getPublicUrl(key),
    });
  } catch {
    return NextResponse.json({ error: "تعذر رفع إشعار الدفع، حاول مرة أخرى" }, { status: 500 });
  }
}

function generatePaymentProofKey(userId: string, contentType: string) {
  const extensionByType: Record<(typeof ALLOWED_TYPES)[number], string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[contentType as (typeof ALLOWED_TYPES)[number]];

  return `payment-proofs/${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}
