import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { R2_BUCKET, R2_PUBLIC_URL, r2Client } from "@/lib/r2";

export type UploadFolder = "avatars" | "portfolio" | "listings";

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 300 });
}

export async function uploadToR2({
  key,
  body,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  await r2Client.send(command);
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  await r2Client.send(command);
}

export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}

export function generateFileKey(folder: UploadFolder, userId: string, fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "bin";
  const timestamp = Date.now();
  const random = crypto.randomUUID();

  return `${folder}/${userId}/${timestamp}-${random}.${safeExtension}`;
}
