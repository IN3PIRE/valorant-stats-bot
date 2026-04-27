import cron from "node-cron";
import { saveSnapshot, cleanupOldSnapshots } from "./services/persistence";
import logger from "./logger";

const ACTIVE_PLAYERS_KEY = "active_players";

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
 
 // This would ideally use Redis, but using in-memory for simplicity
 // In production, use Redis set with TTL
 const activePlayers = getActivePlayers();
 const existingIndex = activePlayers.findIndex(p => p.username.toLowerCase() === username.toLowerCase() && p.tag === tag);
 
 if (existingIndex >= 0) {
 activePlayers[existingIndex] = player;
 } else {
 activePlayers.push(player);
 }
 
 // Keep only last 50 active players to prevent memory bloat
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
 // Take snapshots of active players every 6 hours
 cron.schedule("0 */6 * * *", async () => {
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

 // Cleanup old snapshots daily
 cron.schedule("0 0 * * *", async () => {
 logger.info("Starting daily snapshot cleanup");
 const players = getActivePlayers();
 let totalCleaned = 0;
 
 for (const player of players) {
 const cleaned = await cleanupOldSnapshots(player.username, player.tag);
 totalCleaned += cleaned;
 }
 
 logger.info("Cleaned up %d old snapshots during daily cleanup", totalCleaned);
 });

 logger.info("Snapshot scheduler started (every 6 hours)");
}