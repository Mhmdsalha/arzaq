import { R2_PUBLIC_URL } from "@/lib/r2";

export function extractR2Key(url: string): string | null {
  if (!url) {
    return null;
  }

  try {
    const publicBase = new URL(R2_PUBLIC_URL);
    const parsed = new URL(url);

    if (parsed.origin !== publicBase.origin) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}
