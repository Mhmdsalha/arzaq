import imageCompression from "browser-image-compression";

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

export async function uploadAvatarImage(file: File) {
  const compressedFile = await compressAvatarImage(file);
  const { presignedUrl, publicUrl } = await requestPresignedUploadUrl(compressedFile);

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": compressedFile.type,
    },
    body: compressedFile,
  });

  if (!uploadResponse.ok) {
    throw new Error("تعذر رفع الصورة، حاول مرة أخرى");
  }

  return publicUrl;
}

async function requestPresignedUploadUrl(file: File): Promise<{
  presignedUrl: string;
  publicUrl: string;
  key: string;
}> {
  const response = await fetch("/api/upload/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      folder: "avatars",
    }),
  });

  const data = (await response.json()) as Partial<{
    presignedUrl: string;
    publicUrl: string;
    key: string;
    error: string;
  }>;

  if (!response.ok || !data.presignedUrl || !data.publicUrl || !data.key) {
    throw new Error(data.error ?? "إعدادات رفع الصور غير مكتملة");
  }

  return {
    presignedUrl: data.presignedUrl,
    publicUrl: data.publicUrl,
    key: data.key,
  };
}
