import { sanitizeInt, sanitizeUrlParam } from "@/lib/sanitize";

export function safeSortField<T extends string>(
  field: unknown,
  allowedFields: readonly T[],
  defaultField: T,
): T {
  const cleanField = sanitizeUrlParam(field);

  return allowedFields.includes(cleanField as T) ? (cleanField as T) : defaultField;
}

export function safeSortDir(dir: unknown): "asc" | "desc" {
  return dir === "asc" ? "asc" : "desc";
}

export function safePagination(
  page: unknown,
  limit: unknown,
  options: {
    defaultPage?: number;
    defaultLimit?: number;
    maxPage?: number;
    maxLimit?: number;
  } = {},
) {
  const defaultPage = options.defaultPage ?? 1;
  const defaultLimit = options.defaultLimit ?? 12;
  const maxPage = options.maxPage ?? 1000;
  const maxLimit = options.maxLimit ?? 50;
  const safePage = sanitizeInt(page ?? defaultPage, 1, maxPage);
  const safeLimit = sanitizeInt(limit ?? defaultLimit, 1, maxLimit);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function safeEnum<T extends string>(
  value: unknown,
  values: readonly T[],
): T | undefined {
  const cleanValue = sanitizeUrlParam(value);

  return cleanValue && values.includes(cleanValue as T) ? (cleanValue as T) : undefined;
}
