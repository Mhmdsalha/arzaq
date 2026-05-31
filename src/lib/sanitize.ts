const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<[^>]*>/g;
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeBasicEntities(input: string): string {
  return input.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? "");
}

export function sanitizeText(input: string): string {
  if (!input) {
    return "";
  }

  return decodeBasicEntities(input)
    .replace(HTML_TAGS, "")
    .replace(CONTROL_CHARS, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function sanitizeHTML(input: string): string {
  return sanitizeText(input);
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
