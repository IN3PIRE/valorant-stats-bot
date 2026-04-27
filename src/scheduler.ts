import cron from "node-cron";
import { saveSnapshot, cleanupOldSnapshots } from "./services/persistence";
import logger from "./logger";

const ACTIVE_PLAYERS_KEY = "active_players";
const SNAPSHOT_INTERVAL_HOURS = parseInt(process.env.CRON_SNAPSHOT_INTERVAL_HOURS || "6");
const SNAPSHOT_RETENTION_DAYS = parseInt(process.env.SNAPSHOT_RETENTION_DAYS || "30");

export interface ActivePlayer {
 username: string;
 tag: string;
 lastQueried: number;
}

export function addActivePlayer(username: string, tag: string): void {
 const player: ActivePlayer = {
 username,
 tag,
 lastQueried: Date.now()
 };
 
 const activePlayers = getActivePlayers();
 const existingIndex = activePlayers.findIndex(p => p.username.toLowerCase() === username.toLowerCase() && p.tag === tag);
 
 if (existingIndex >= 0) {
 activePlayers[existingIndex] = player;
 } else {
 activePlayers.push(player);
 }
 
 if (activePlayers.length > 50) {
 activePlayers.sort((a, b) => b.lastQueried - a.lastQueried);
 activePlayers.splice(50);
 }
 
 (global as any).__activePlayers = activePlayers;
 logger.debug("Added %s#%s to active players", username, tag);
}

export function getActivePlayers(): ActivePlayer[] {
 return (global as any).__activePlayers || [];
}

export function startSnapshotScheduler(): void {
 const cronPattern = `0 */${SNAPSHOT_INTERVAL_HOURS} * * *`;
 
 cron.schedule(cronPattern, async () => {
 logger.info("Starting scheduled snapshot collection");
 const players = getActivePlayers();
 
 for (const player of players) {
 try {
 const { getValorantStats } = await import("./services/tracker");
 const stats = await getValorantStats(player.username, player.tag);
 await saveSnapshot({
 username: player.username,
 tag: player.tag,
 timestamp: Date.now(),
 stats: stats.stats
 });
 logger.debug("Scheduled snapshot saved for %s#%s", player.username, player.tag);
 } catch (err) {
 logger.error("Failed to snapshot %s#%s: %s", player.username, player.tag, (err as any).message);
 }
 }
 
 logger.info("Completed scheduled snapshot collection for %d players", players.length);
 });

 cron.schedule("0 0 * * *", async () => {
 logger.info("Starting daily snapshot cleanup");
 const players = getActivePlayers();
 let totalCleaned = 0;
 const maxAgeMs = SNAPSHOT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
 
 for (const player of players) {
 const cleaned = await cleanupOldSnapshots(player.username, player.tag, maxAgeMs);
 totalCleaned += cleaned;
 }
 
 logger.info("Cleaned up %d old snapshots during daily cleanup", totalCleaned);
 });

 logger.info("Snapshot scheduler started (every %d hours, retention %d days)", SNAPSHOT_INTERVAL_HOURS, SNAPSHOT_RETENTION_DAYS);
}