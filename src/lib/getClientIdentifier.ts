import { headers } from "next/headers";

export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip")?.trim() ??
    headersList.get("cf-connecting-ip")?.trim() ??
    "unknown"
  );
}

export async function getRateLimitKey(
  userId?: string | null,
  fallback?: string,
): Promise<string> {
  return userId ?? fallback ?? getClientIP();
}
