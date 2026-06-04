import { createHmac, timingSafeEqual } from "crypto";

import { env } from "@/lib/env";

type UploadProxyTokenInput = {
  key: string;
  userId: string;
  contentType: string;
  expiresAt: number;
};

export function createUploadProxyToken(input: UploadProxyTokenInput): string {
  return createHmac("sha256", env.NEXTAUTH_SECRET).update(toPayload(input)).digest("hex");
}

export function validateUploadProxyToken(input: UploadProxyTokenInput & { token: string }): boolean {
  if (Date.now() > input.expiresAt) {
    return false;
  }

  const expected = createUploadProxyToken(input);
  const expectedBuffer = Buffer.from(expected, "hex");
  const tokenBuffer = Buffer.from(input.token, "hex");

  return expectedBuffer.length === tokenBuffer.length && timingSafeEqual(expectedBuffer, tokenBuffer);
}

function toPayload(input: UploadProxyTokenInput) {
  return `${input.userId}:${input.key}:${input.contentType}:${input.expiresAt}`;
}
