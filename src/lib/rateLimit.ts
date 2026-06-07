import { createHash } from "crypto";

import { redis } from "@/lib/redis";

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
};

export const rateLimiters = {
  login: (key: string) => rateLimit(`login:${key}`, { limit: 20, windowSeconds: 15 * 60 }),
  register: (key: string) => rateLimit(`register:${key}`, { limit: 5, windowSeconds: 60 * 60 }),
  createJob: (userId: string) => rateLimit(`create-job:${userId}`, { limit: 10, windowSeconds: 60 * 60 }),
  createOffer: (userId: string) =>
    rateLimit(`create-offer:${userId}`, { limit: 30, windowSeconds: 60 * 60 }),
  createListing: (userId: string) =>
    rateLimit(`create-listing:${userId}`, { limit: 12, windowSeconds: 60 * 60 }),
  createOrder: (userId: string) =>
    rateLimit(`create-order:${userId}`, { limit: 10, windowSeconds: 60 * 60 }),
  createReview: (userId: string) =>
    rateLimit(`create-review:${userId}`, { limit: 20, windowSeconds: 60 * 60 }),
  report: (userId: string) =>
    rateLimit(`report:${userId}`, { limit: 6, windowSeconds: 60 * 60 }),
  updateProfile: (userId: string) =>
    rateLimit(`update-profile:${userId}`, { limit: 20, windowSeconds: 60 * 60 }),
  settings: (userId: string) =>
    rateLimit(`settings:${userId}`, { limit: 10, windowSeconds: 60 * 60 }),
  providerVerification: (userId: string) =>
    rateLimit(`provider-verification:${userId}`, { limit: 3, windowSeconds: 24 * 60 * 60 }),
  adminAction: (userId: string) =>
    rateLimit(`admin-action:${userId}`, { limit: 120, windowSeconds: 60 * 60 }),
  upload: (userId: string) => rateLimit(`upload:${userId}`, { limit: 40, windowSeconds: 60 * 60 }),
  passwordReset: (key: string) =>
    rateLimit(`password-reset:${key}`, { limit: 5, windowSeconds: 60 * 60 }),
};

export async function rateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (!redis) {
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit,
      resetSeconds: options.windowSeconds,
    };
  }

  const redisKey = `arzaq:rate-limit:${hashKey(key)}`;
  let count: number;

  try {
    count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, options.windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);

    return {
      success: count <= options.limit,
      limit: options.limit,
      remaining: Math.max(options.limit - count, 0),
      resetSeconds: ttl > 0 ? ttl : options.windowSeconds,
    };
  } catch (error) {
    console.error("Rate limiter failed open:", error);

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit,
      resetSeconds: options.windowSeconds,
    };
  }
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  const resetAt = Math.floor(Date.now() / 1000) + Math.max(result.resetSeconds, 0);

  return {
    "Retry-After": String(Math.max(result.resetSeconds, 1)),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(resetAt),
  };
}

function hashKey(key: string) {
  return createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
}
