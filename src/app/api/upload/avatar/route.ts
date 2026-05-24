import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { generateFileKey, getPublicUrl, uploadToR2 } from "@/lib/uploadImage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_AVATAR_BYTES = 450 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "نوع الصورة غير مدعوم، يسمح بـ JPG و PNG و WebP فقط" },
      { status: 400 },
    );
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { error: "حجم الصورة بعد الضغط يجب ألا يتجاوز 450KB" },
      { status: 400 },
    );
  }

  try {
    const key = generateFileKey("avatars", session.user.id, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
    });

    return NextResponse.json({
      key,
      publicUrl: getPublicUrl(key),
    });
  } catch {
    return NextResponse.json({ error: "تعذر رفع الصورة، حاول مرة أخرى" }, { status: 500 });
  }
}
