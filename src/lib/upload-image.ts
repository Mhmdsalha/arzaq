import imageCompression from "browser-image-compression";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL_AVATAR_BYTES = 6 * 1024 * 1024;
const MAX_COMPRESSED_AVATAR_BYTES = 450 * 1024;
const MIN_AVATAR_DIMENSION = 200;
const MAX_AVATAR_DIMENSION = 4000;

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
    fileType: file.type === "image/png" ? "image/png" : "image/webp",
  });
}

export async function uploadAvatarImage(file: File) {
  await validateAvatarFile(file);
  const compressedFile = await compressAvatarImage(file);

  if (compressedFile.size > MAX_COMPRESSED_AVATAR_BYTES) {
    throw new Error("حجم الصورة بعد الضغط يجب ألا يتجاوز 450KB");
  }

  const formData = new FormData();
  formData.append("file", compressedFile, normalizedFileName(compressedFile));

  const response = await fetch("/api/upload/avatar", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as Partial<{
    publicUrl: string;
    error: string;
  }>;

  if (!response.ok || !data.publicUrl) {
    throw new Error(data.error ?? "تعذر رفع الصورة، حاول مرة أخرى");
  }

  return data.publicUrl;
}

async function validateAvatarFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("نوع الصورة غير مدعوم، يسمح بـ JPG و PNG و WebP فقط");
  }

  if (file.size > MAX_ORIGINAL_AVATAR_BYTES) {
    throw new Error("حجم الصورة الأصلي يجب ألا يتجاوز 6MB");
  }

  const { width, height } = await readImageDimensions(file);

  if (width < MIN_AVATAR_DIMENSION || height < MIN_AVATAR_DIMENSION) {
    throw new Error("أبعاد الصورة صغيرة جداً، الحد الأدنى 200×200 بكسل");
  }

  if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION) {
    throw new Error("أبعاد الصورة كبيرة جداً، الحد الأعلى 4000×4000 بكسل");
  }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("تعذر قراءة أبعاد الصورة"));
    };

    image.src = objectUrl;
  });
}

function normalizedFileName(file: File) {
  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-") || "avatar";

  return `${baseName}.${extension}`;
}
