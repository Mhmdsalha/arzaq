import { S3Client } from "@aws-sdk/client-s3";

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${readRequiredEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: readRequiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: readRequiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
  },
});

export const R2_BUCKET = readRequiredEnv("CLOUDFLARE_R2_BUCKET_NAME");
export const R2_PUBLIC_URL = readRequiredEnv("CLOUDFLARE_R2_PUBLIC_URL");
