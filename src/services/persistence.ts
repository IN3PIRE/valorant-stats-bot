import { createClient } from "redis";
import logger from "../logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => logger.error("Redis error: %s", err));

let connected = false;

async function ensureConnected() {
 if (!connected) {
 await redis.connect();
 connected = true;
 }
}

export interface PlayerSnapshot {
 username: string;
 tag: string;
 timestamp: number;
 stats: {
 rating: number;
 matchesPlayed: number;
 wins: number;
 kills: number;
 deaths: number;
 assists: number;
 headshots: number;
 };
}

export async function saveSnapshot(snapshot: PlayerSnapshot): Promise<void> {
 await ensureConnected();
 const key = `snapshot:${snapshot.username.toLowerCase()}:${snapshot.tag}:${snapshot.timestamp}`;
 await redis.set(key, JSON.stringify(snapshot));
 await redis.zAdd(`snapshots:${snapshot.username.toLowerCase()}:${snapshot.tag}`, {
 score: snapshot.timestamp,
 value: String(snapshot.timestamp),
 });
 logger.debug("Saved snapshot for %s#%s", snapshot.username, snapshot.tag);
}

export async function getLatestSnapshot(username: string, tag: string): Promise<PlayerSnapshot | null> {
 await ensureConnected();
 const key = `snapshots:${username.toLowerCase()}:${tag}`;
 const result = await redis.zRange(key, -1, -1);
 if (!result.length) return null;
 const latestTs = result[0];
 const data = await redis.get(`snapshot:${username.toLowerCase()}:${tag}:${latestTs}`);
 return data ? JSON.parse(data) : null;
}

export async function getSnapshots(username: string, tag: string, limit = 30): Promise<PlayerSnapshot[]> {
 await ensureConnected();
 const key = `snapshots:${username.toLowerCase()}:${tag}`;
 const results = await redis.zRange(key, -limit, -1);
 if (!results.length) return [];
 const keys = results.map((ts) => `snapshot:${username.toLowerCase()}:${tag}:${ts}`);
 const data = await redis.mGet(keys);
 return data.filter(Boolean).map((d) => JSON.parse(d as string));
}

export async function cleanupOldSnapshots(username: string, tag: string, maxAgeMs = 30 * 24 * 60 * 60 * 1000): Promise<number> {
 await ensureConnected();
 const cutoff = Date.now() - maxAgeMs;
 const key = `snapshots:${username.toLowerCase()}:${tag}`;
 const removed = await redis.zRemRangeByScore(key, 0, cutoff);
 logger.info("Cleaned up %d old snapshots for %s#%s", removed, username, tag);
 return removed;
}