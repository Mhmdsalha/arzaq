"use client";

type CompressionOptions = {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType?: string;
};

export const IMAGE_COMPRESSION_OPTIONS = {
  listing: {
    maxSizeMB: 0.95,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
  },
  avatar: {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: "image/webp",
  },
  message: {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: "image/webp",
  },
} as const satisfies Record<string, CompressionOptions>;

export async function compressImage(
  file: File,
  type: keyof typeof IMAGE_COMPRESSION_OPTIONS = "listing",
  overrides?: Partial<CompressionOptions>,
): Promise<File> {
  const { default: imageCompression } = await import("browser-image-compression");
  const options = {
    ...IMAGE_COMPRESSION_OPTIONS[type],
    ...overrides,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed:", error);
    return file;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
