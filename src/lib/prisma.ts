import { PrismaClient } from "@prisma/client";

const TRANSIENT_DATABASE_ERROR_CODES = new Set(["P1001", "P1002"]);

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const datasourceUrl =
    process.env.NODE_ENV === "development"
      ? (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
      : process.env.DATABASE_URL;

  return new PrismaClient({
    datasourceUrl,
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

async function withDatabaseRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientDatabaseError(error) || attempt === attempts) {
        throw error;
      }

      await wait(300 * attempt);
    }
  }

  throw lastError;
}

function isTransientDatabaseError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === "string" && TRANSIENT_DATABASE_ERROR_CODES.has(code);
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
