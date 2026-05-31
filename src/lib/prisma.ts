import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

const TRANSIENT_DATABASE_ERROR_CODES = new Set(["P1001", "P1002"]);
const DATABASE_CONNECTION_ERROR_CODES = new Set(["P1000", "P1001", "P1002"]);
const DATABASE_UNAVAILABLE_CACHE_MS = 30_000;

let databaseUnavailableUntil = 0;

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.NODE_ENV === "development"
            ? (env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL)
            : env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return withDatabaseRetry(() => query(args));
        },
      },
    },
  });
}

async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  attempts = process.env.NODE_ENV === "development" ? 1 : 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (isDatabaseConnectionError(error)) {
        markDatabaseUnavailable();
      }

      if (!isTransientDatabaseError(error) || attempt === attempts) {
        throw error;
      }

      await wait(300 * attempt);
    }
  }

  throw lastError;
}

function isTransientDatabaseError(error: unknown): boolean {
  const code = getPrismaErrorCode(error);

  return typeof code === "string" && TRANSIENT_DATABASE_ERROR_CODES.has(code);
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const code = getPrismaErrorCode(error);

  if (typeof code === "string" && DATABASE_CONNECTION_ERROR_CODES.has(code)) {
    return true;
  }

  const message = error instanceof Error ? error.message : "";

  return (
    message.includes("Can't reach database server") ||
    message.includes("Authentication failed against database server")
  );
}

export function isDatabaseTemporarilyUnavailable(): boolean {
  return Date.now() < databaseUnavailableUntil;
}

function markDatabaseUnavailable() {
  databaseUnavailableUntil = Date.now() + DATABASE_UNAVAILABLE_CACHE_MS;
}

function getPrismaErrorCode(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  return (error as { code?: unknown }).code;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
