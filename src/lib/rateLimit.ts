import { createHash } from "crypto";

import { redis } from "@/lib/redis";

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetSeconds: number;
};

export const rateLimiters = {
  login: (key: string) => rateLimit(`login:${key}`, { limit: 20, windowSeconds: 15 * 60 }),
  register: (key: string) => rateLimit(`register:${key}`, { limit: 5, windowSeconds: 60 * 60 }),
  createJob: (userId: string) => rateLimit(`create-job:${userId}`, { limit: 10, windowSeconds: 60 * 60 }),
  createOffer: (userId: string) =>
    rateLimit(`create-offer:${userId}`, { limit: 30, windowSeconds: 60 * 60 }),
  createOrder: (userId: string) =>
    rateLimit(`create-order:${userId}`, { limit: 10, windowSeconds: 60 * 60 }),
  createReview: (userId: string) =>
    rateLimit(`create-review:${userId}`, { limit: 20, windowSeconds: 60 * 60 }),
  report: (userId: string) =>
    rateLimit(`report:${userId}`, { limit: 6, windowSeconds: 60 * 60 }),
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
      remaining: options.limit,
      resetSeconds: options.windowSeconds,
    };
  }

  const redisKey = `arzaq:rate-limit:${hashKey(key)}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.expire(redisKey, options.windowSeconds);
  }

  const ttl = await redis.ttl(redisKey);

  return {
    success: count <= options.limit,
    remaining: Math.max(options.limit - count, 0),
    resetSeconds: ttl > 0 ? ttl : options.windowSeconds,
  };
}

function hashKey(key: string) {
  return createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
}
