"use client";

import { compressImage as compressBrowserImage } from "@/lib/imageCompression";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL_AVATAR_BYTES = 6 * 1024 * 1024;
const MAX_COMPRESSED_AVATAR_BYTES = 450 * 1024;
const MAX_ORIGINAL_LISTING_BYTES = 8 * 1024 * 1024;
const MAX_COMPRESSED_LISTING_BYTES = 1024 * 1024;
const MIN_AVATAR_DIMENSION = 200;
const MAX_AVATAR_DIMENSION = 4000;

export async function compressImage(file: File) {
  return compressBrowserImage(file, "listing", {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });
}

export async function compressAvatarImage(file: File) {
  return compressBrowserImage(file, "avatar", {
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
  const csrfToken = await getCsrfToken();

  const response = await fetch("/api/upload/avatar", {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
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

export async function uploadListingImage(file: File) {
  await validateListingFile(file);
  const compressedFile = await compressBrowserImage(file, "listing", {
    maxSizeMB: 0.95,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: file.type === "image/png" ? "image/png" : "image/webp",
  });

  if (compressedFile.size > MAX_COMPRESSED_LISTING_BYTES) {
    throw new Error("حجم الصورة بعد الضغط يجب ألا يتجاوز 1MB");
  }

  const csrfToken = await getCsrfToken();
  const formData = new FormData();
  formData.append("file", compressedFile, normalizedFileName(compressedFile));

  const response = await fetch("/api/upload/listing", {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
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

async function getCsrfToken() {
  const response = await fetch("/api/csrf", {
    method: "GET",
    cache: "no-store",
  });
  const data = (await response.json()) as Partial<{ token: string }>;

  if (!response.ok || !data.token) {
    throw new Error("تعذر تجهيز حماية الطلب، حاول مرة أخرى");
  }

  return data.token;
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

async function validateListingFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("نوع الصورة غير مدعوم، يُسمح بـ JPG و PNG و WebP فقط");
  }

  if (file.size > MAX_ORIGINAL_LISTING_BYTES) {
    throw new Error("حجم الصورة الأصلي يجب ألا يتجاوز 8MB");
  }

  const { width, height } = await readImageDimensions(file);

  if (width < 300 || height < 220) {
    throw new Error("أبعاد الصورة صغيرة جداً، الحد الأدنى 300×220 بكسل");
  }

  if (width > 5000 || height > 5000) {
    throw new Error("أبعاد الصورة كبيرة جداً، الحد الأعلى 5000×5000 بكسل");
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
