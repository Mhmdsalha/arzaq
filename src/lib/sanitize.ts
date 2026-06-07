import DOMPurify from "isomorphic-dompurify";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SEARCH_DANGEROUS_CHARS = /[<>'"`;\\]/g;

function asString(input: unknown): string {
  return typeof input === "string" ? input : "";
}

function normalizeWhitespace(input: string): string {
  return input.replace(CONTROL_CHARS, "").trim().replace(/\s+/g, " ");
}

// Plain text fields: strip all HTML and normalize whitespace.
export function sanitizeText(input: unknown, maxLength = 10000): string {
  const value = asString(input);

  if (!value) {
    return "";
  }

  return normalizeWhitespace(
    DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }),
  ).slice(0, maxLength);
}

// Rich text fields: allow only a very small safe formatting subset.
export function sanitizeRichText(input: unknown, maxLength = 50000): string {
  const value = asString(input);

  if (!value) {
    return "";
  }

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["b", "i", "u", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  }).slice(0, maxLength);
}

// Backward-compatible alias used by older code paths.
export function sanitizeHTML(input: unknown): string {
  return sanitizeRichText(input);
}

export function sanitizeUrl(input: unknown): string {
  const value = asString(input).trim();

  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizePhone(input: unknown): string {
  return asString(input).replace(/[^\d+\s()-]/g, "").trim().slice(0, 20);
}

export function sanitizeSearchQuery(input: unknown): string {
  return sanitizeText(input, 200).replace(SEARCH_DANGEROUS_CHARS, "").slice(0, 200);
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(trimmed) ? trimmed : "";
}

export function sanitizeInt(
  input: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number.parseInt(String(input), 10);

  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
}

export function sanitizeFloat(input: unknown, min = 0, max = 999999): number {
  const parsed = Number.parseFloat(String(input));

  if (Number.isNaN(parsed)) {
    return min;
  }

  return Math.min(Math.max(parsed, min), max);
}

export function sanitizeStringArray(
  input: unknown,
  maxItems = 10,
  maxLength = 100,
): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .slice(0, maxItems)
    .map((item) => sanitizeText(item, maxLength))
    .filter(Boolean);
}

export function sanitizeUrlParam(input: unknown): string {
  return asString(input).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
}

export function sanitizeFilename(input: unknown): string {
  const value = asString(input) || "file";

  return value
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, "")
    .slice(0, 255) || "file";
}
