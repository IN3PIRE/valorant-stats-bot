import * as dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN ?? "",
  PREFIX: process.env.PREFIX ?? "!v",
  TRACKER_GG_API_KEY: process.env.TRACKER_GG_API_KEY ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  MAX_API_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_API_REQUESTS_PER_MINUTE ?? "60", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10),
};

if (!CONFIG.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required in .env");
}
if (!CONFIG.TRACKER_GG_API_KEY) {
  throw new Error("TRACKER_GG_API_KEY is required in .env");
}
