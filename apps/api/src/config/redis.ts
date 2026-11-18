import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

let redisClient: Redis | null = null;
let redisReady = false;

/**
 * Returns the shared Redis client when REDIS_URL is configured and reachable.
 * Never throws during startup if Redis is offline—callers fall back gracefully.
 */
export function getRedisClient(): Redis | null {
  if (env.NODE_ENV === "test" || !env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on("ready", () => {
      redisReady = true;
      logger.info("Redis connection ready");
    });

    redisClient.on("error", (err) => {
      if (redisReady) {
        logger.warn({ err: err.message }, "Redis connection lost");
      }
      redisReady = false;
    });

    redisClient.on("close", () => {
      redisReady = false;
    });

    // Initiate non-blocking background connection
    redisClient.connect().catch(() => {
      redisReady = false;
    });
  }

  return redisReady ? redisClient : null;
}

export async function getRedisHealth(): Promise<
  "connected" | "disabled" | "unavailable"
> {
  if (env.NODE_ENV === "test" || !env.REDIS_URL) {
    return "disabled";
  }

  const client = getRedisClient();
  if (!client) return "unavailable";

  try {
    const pong = await client.ping();
    return pong === "PONG" ? "connected" : "unavailable";
  } catch {
    return "unavailable";
  }
}

export async function closeRedis(): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.quit();
  } catch {
    redisClient.disconnect();
  } finally {
    redisClient = null;
    redisReady = false;
  }
}
