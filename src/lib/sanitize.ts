import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(input: string): string {
  if (!input) {
    return "";
  }

  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .trim()
    .replace(/\s+/g, " ");
}

export function sanitizeHTML(input: string): string {
  if (!input) {
    return "";
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "br", "p"],
    ALLOWED_ATTR: [],
  }).trim();
}

export function sanitizeUrl(url: string): string {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url.trim());

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\s()-]/g, "").trim();
}

export function sanitizeSearchQuery(query: string): string {
  return sanitizeText(query).slice(0, 100);
}
