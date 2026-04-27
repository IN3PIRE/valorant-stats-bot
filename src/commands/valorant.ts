import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getValorantStats } from "../services/tracker";
import { addActivePlayer } from "../scheduler";
import logger from "../logger";

export const data = new SlashCommandBuilder()
 .setName("valorant")
 .setDescription("Get Valorant player statistics")
 .addStringOption((opt) =>
 opt
 .setName("riot_id")
 .setDescription("Riot ID in the form username#tag (e.g. shy#NA1)")
 .setRequired(true)
 );

export async function execute(interaction: ChatInputCommandInteraction) {
 await interaction.deferReply();
 const riotId = interaction.options.getString("riot_id", true);
 const [username, tag] = riotId.split("#");

 if (!username || !tag) {
 await interaction.editReply("❌ Please provide the Riot ID in the format `username#tag`.");
 return;
 }

 try {
 const stats = await getValorantStats(username, tag);
 
 // Track this player for automated snapshots
 addActivePlayer(username, tag);
 
 const embed = {
 title: `${stats.username}#${stats.tag} – Valorant Stats`,
 color: 0x7289da,
 fields: [
 { name: "Rating", value: String(stats.stats.rating), inline: true },
 { name: "Matches Played", value: String(stats.stats.matchesPlayed), inline: true },
 { name: "Wins", value: String(stats.stats.wins), inline: true },
 { name: "K/D/A", value: `${stats.stats.kills}/${stats.stats.deaths}/${stats.stats.assists}`, inline: true },
 { name: "Headshots", value: String(stats.stats.headshots), inline: true },
 ],
 footer: { text: "Data powered by Tracker.gg" },
 timestamp: new Date().toISOString(),
 };
 await interaction.editReply({ embeds: [embed] });
 } catch (err: any) {
 logger.warn(err.message);
 await interaction.editReply(`❌ ${err.message}`);
 }
}