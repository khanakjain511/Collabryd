import { getRedisClient } from "../config/redis.js";

/**
 * Read-through JSON cache backed by Redis.
 * Transparently executes `loader()` when Redis is unavailable or disabled.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const redis = getRedisClient();
  if (!redis) {
    return loader();
  }

  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Ignore cache read failures and serve directly from PostgreSQL
  }

  const fresh = await loader();

  try {
    await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch {
    // Ignore cache write failures
  }

  return fresh;
}

/**
 * Deletes all Redis keys matching a prefix (e.g. `catalog:skills:*`) using SCAN.
 */
export async function invalidateCachePrefix(prefix: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Non-fatal: cached items expire via TTL
  }
}
