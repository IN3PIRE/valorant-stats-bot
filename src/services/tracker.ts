import axios from "axios";
import { CONFIG } from "../config";
import { ValorantStats } from "../types";
import logger from "../logger";
import { getCached, setCached } from "../cache";

const API_BASE = "https://public-api.tracker.gg/v2/valorant";

/**
 * Fetch raw Valorant data from Tracker.gg.
 * The Tracker.gg public API requires the API key in the `TRN-Api-Key` header.
 */
async function fetchValorantRaw(username: string, tag: string): Promise<any> {
  const endpoint = `${API_BASE}/profile/${encodeURIComponent(username)}%23${encodeURIComponent(tag)}`;
  const cacheKey = `tracker:valorant:${username.toLowerCase()}#${tag}`;

  // Try cache first (5‑minute TTL)
  const cached = await getCached<any>(cacheKey);
  if (cached) {
    logger.debug("Cache hit for %s#%s", username, tag);
    return cached;
  }

  const response = await axios.get(endpoint, {
    headers: { "TRN-Api-Key": CONFIG.TRACKER_GG_API_KEY },
    timeout: 10_000,
  });

  await setCached(cacheKey, response.data, 300);
  return response.data;
}

export async function getValorantStats(username: string, tag: string): Promise<ValorantStats> {
  try {
    const raw = await fetchValorantRaw(username, tag);
    // Transform Tracker.gg schema into a stable internal shape
    const { data } = raw;
    const stats = data.segments.find((s: any) => s.type === "overview");
    const rating = stats.stats.rating.value;
    const matchesPlayed = stats.stats.matchesPlayed.value;
    const wins = stats.stats.wins.value;
    const kills = stats.stats.kills.value;
    const deaths = stats.stats.deaths.value;
    const assists = stats.stats.assists.value;
    const headshots = stats.stats.headshots.value;

    return {
      username,
      tag,
      puuid: data.id,
      region: data.platformInfo?.platformSlug ?? "unknown",
      stats: {
        rating,
        matchesPlayed,
        wins,
        kills,
        deaths,
        assists,
        headshots,
      },
    };
  } catch (err: any) {
    logger.error("Failed to fetch Valorant stats for %s#%s: %s", username, tag, err.message);
    throw new Error("Unable to retrieve stats – check username/tag and API key.");
  }
}
