import Redis from "ioredis";
import { CONFIG } from "./config";
import logger from "./logger";

export const redis = new Redis(CONFIG.REDIS_URL);

redis.on("error", (err) => logger.error("Redis error: %s", err));

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function setCached<T>(key: string, value: T, ttlSec: number = 300): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSec);
}
