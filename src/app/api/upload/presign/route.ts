import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import {
  generateFileKey,
  getPresignedUploadUrl,
  getPublicUrl,
  type UploadFolder,
} from "@/lib/uploadImage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ALLOWED_FOLDERS: UploadFolder[] = ["avatars", "portfolio"];
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

  const body = (await req.json()) as PresignRequestBody;

  if (typeof body.fileName !== "string" || body.fileName.trim().length === 0) {
    return NextResponse.json({ error: "اسم الملف مطلوب" }, { status: 400 });
  }

  if (typeof body.contentType !== "string" || !ALLOWED_TYPES.includes(body.contentType as never)) {
    return NextResponse.json(
      { error: "نوع الملف غير مدعوم، يُسمح بـ JPG و PNG و WebP فقط" },
      { status: 400 },
    );
  }

  if (typeof body.fileSize !== "number" || !Number.isFinite(body.fileSize)) {
    return NextResponse.json({ error: "حجم الملف غير صحيح" }, { status: 400 });
  }

  if (body.fileSize > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح (2MB)" }, { status: 400 });
  }

  if (typeof body.folder !== "string" || !ALLOWED_FOLDERS.includes(body.folder as UploadFolder)) {
    return NextResponse.json({ error: "مجلد الرفع غير صحيح" }, { status: 400 });
  }

  const key = generateFileKey(body.folder as UploadFolder, session.user.id, body.fileName);
  const presignedUrl = await getPresignedUploadUrl(key, body.contentType);
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ presignedUrl, publicUrl, key });
}
