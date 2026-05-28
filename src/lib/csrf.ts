import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { env } from "@/lib/env";

export function generateCSRFToken(): string {
  const token = randomBytes(32).toString("hex");
  const hmac = createHmac("sha256", env.NEXTAUTH_SECRET).update(token).digest("hex");

  return `${token}.${hmac}`;
}

export function validateCSRFToken(token: string): boolean {
  try {
    const [raw, hmac] = token.split(".");

    if (!raw || !hmac) {
      return false;
    }

    const expected = createHmac("sha256", env.NEXTAUTH_SECRET).update(raw).digest("hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const hmacBuffer = Buffer.from(hmac, "hex");

    return expectedBuffer.length === hmacBuffer.length && timingSafeEqual(expectedBuffer, hmacBuffer);
  } catch {
    return false;
  }
}
