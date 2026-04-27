import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getValorantStats } from "../services/tracker";
import { saveSnapshot, getSnapshots, getLatestSnapshot } from "../services/persistence";
import logger from "../logger";

export const data = new SlashCommandBuilder()
 .setName("history")
 .setDescription("View rating history for a player")
 .addStringOption((opt) =>
 opt
 .setName("riot_id")
 .setDescription("Riot ID in the format username#tag")
 .setRequired(true)
 )
 .addIntegerOption((opt) =>
 opt
 .setName("days")
 .setDescription("Number of days to show (default: 7)")
 .setMinValue(1)
 .setMaxValue(30)
 );

export async function execute(interaction: ChatInputCommandInteraction) {
 await interaction.deferReply();
 const riotId = interaction.options.getString("riot_id", true);
 const days = interaction.options.getInteger("days") || 7;
 const [username, tag] = riotId.split("#");

 if (!username || !tag) {
 await interaction.editReply("❌ Please provide the Riot ID in the format `username#tag`.");
 return;
 }

 try {
 // Fetch current stats and save snapshot
 const currentStats = await getValorantStats(username, tag);
 await saveSnapshot({
 username,
 tag,
 timestamp: Date.now(),
 stats: currentStats.stats
 });

 // Get historical snapshots
 const allSnapshots = await getSnapshots(username, tag, 30);
 const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
 const recentSnapshots = allSnapshots.filter(s => s.timestamp >= cutoff);

 if (recentSnapshots.length === 0) {
 await interaction.editReply("📊 No historical data available yet. Check back tomorrow!");
 return;
 }

 // Calculate rating change
 const oldest = recentSnapshots[0];
 const newest = recentSnapshots[recentSnapshots.length - 1];
 const ratingChange = newest.stats.rating - oldest.stats.rating;
 const changeEmoji = ratingChange > 0 ? "📈" : ratingChange < 0 ? "📉" : "➡️";

 // Build simple text-based chart
 const maxRating = Math.max(...recentSnapshots.map(s => s.stats.rating));
 const minRating = Math.min(...recentSnapshots.map(s => s.stats.rating));
 const range = Math.max(1, maxRating - minRating);
 
 const chartLines = recentSnapshots.map(s => {
 const normalized = ((s.stats.rating - minRating) / range) * 20;
 const bar = "▇".repeat(Math.max(1, Math.floor(normalized)));
 const date = new Date(s.timestamp).toLocaleDateString();
 return `\`${date}\` \`\`${s.stats.rating.toString().padStart(4)}\`\` ${bar}`;
 }).join("\n");

 const embed = {
 title: `📊 Rating History - ${username}#${tag}`,
 description: `**${changeEmoji} Rating change: ${ratingChange > 0 ? "+" : ""}${ratingChange.toFixed(1)}** over ${days} day(s)\n\n${chartLines}`,
 color: ratingChange > 0 ? 0x00ff00 : ratingChange < 0 ? 0xff0000 : 0x7289da,
 fields: [
 { name: "Current Rating", value: `${newest.stats.rating}`, inline: true },
 { name: "Peak Rating", value: `${maxRating}`, inline: true },
 { name: "Total Matches", value: `${newest.stats.matchesPlayed}`, inline: true },
 ],
 footer: { text: `Showing ${recentSnapshots.length} data point(s)` },
 timestamp: new Date().toISOString(),
 };

 await interaction.editReply({ embeds: [embed] });
 } catch (err: any) {
 logger.warn(err.message);
 await interaction.editReply(`❌ ${err.message}`);
 }
}