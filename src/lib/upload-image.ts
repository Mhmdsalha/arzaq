import imageCompression from "browser-image-compression";
import { createClient } from "@supabase/supabase-js";

export async function compressImage(file: File) {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });
}

export async function compressAvatarImage(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  });
}

export async function uploadAvatarImage(file: File, userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("إعدادات رفع الصور غير مكتملة");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const compressedFile = await compressAvatarImage(file);
  const fileExtension = compressedFile.name.split(".").pop() ?? "jpg";
  const filePath = `${userId}/${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage.from("avatars").upload(filePath, compressedFile, {
    cacheControl: "31536000",
    contentType: compressedFile.type,
    upsert: true,
  });

  if (error) {
    throw new Error("تعذر رفع الصورة، حاول مرة أخرى");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return publicUrl;
}
