import { createHash } from "crypto";

import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;

export async function getLoginLockoutMinutes(identifier: string): Promise<number | null> {
  if (!redis) {
    return null;
  }

  const ttl = await redis.ttl(lockKey(identifier));

  if (ttl <= 0) {
    return null;
  }

  return Math.ceil(ttl / 60);
}

export async function recordFailedLogin(identifier: string): Promise<number | null> {
  if (!redis) {
    return null;
  }

  const key = attemptsKey(identifier);
  const attempts = await redis.incr(key);
  await redis.expire(key, WINDOW_SECONDS);

  if (attempts >= MAX_ATTEMPTS) {
    await redis.set(lockKey(identifier), "locked", { ex: WINDOW_SECONDS });
    return Math.ceil(WINDOW_SECONDS / 60);
  }

  return null;
}

export async function clearLoginLockout(identifier: string): Promise<void> {
  if (!redis) {
    return;
  }

  await redis.del(attemptsKey(identifier), lockKey(identifier));
}

function attemptsKey(identifier: string) {
  return `arzaq:login-attempts:${hashIdentifier(identifier)}`;
}

function lockKey(identifier: string) {
  return `arzaq:login-lock:${hashIdentifier(identifier)}`;
}

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex");
}
