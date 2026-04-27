import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getValorantStats } from "../services/tracker";
import logger from "../logger";

export const data = new SlashCommandBuilder()
 .setName("compare")
 .setDescription("Compare Valorant stats between two players")
 .addStringOption((opt) =>
 opt
 .setName("player1")
 .setDescription("First player Riot ID (username#tag)")
 .setRequired(true)
 )
 .addStringOption((opt) =>
 opt
 .setName("player2")
 .setDescription("Second player Riot ID (username#tag)")
 .setRequired(true)
 );

export async function execute(interaction: ChatInputCommandInteraction) {
 await interaction.deferReply();
 const player1Id = interaction.options.getString("player1", true);
 const player2Id = interaction.options.getString("player2", true);

 const [p1Name, p1Tag] = player1Id.split("#");
 const [p2Name, p2Tag] = player2Id.split("#");

 if (!p1Name || !p1Tag || !p2Name || !p2Tag) {
 await interaction.editReply("❌ Both IDs must be in format `username#tag`.");
 return;
 }

 try {
 const [stats1, stats2] = await Promise.all([
 getValorantStats(p1Name, p1Tag),
 getValorantStats(p2Name, p2Tag)
 ]);

 const kd1 = (stats1.stats.kills / Math.max(1, stats1.stats.deaths)).toFixed(2);
 const kd2 = (stats2.stats.kills / Math.max(1, stats2.stats.deaths)).toFixed(2);
 const winRate1 = ((stats1.stats.wins / Math.max(1, stats1.stats.matchesPlayed)) * 100).toFixed(1);
 const winRate2 = ((stats2.stats.wins / Math.max(1, stats2.stats.matchesPlayed)) * 100).toFixed(1);

 const embed = {
 title: "⚔️ Valorant Stats Comparison",
 color: 0xff6b6b,
 fields: [
 { name: "Metric", value: "Player", inline: true },
 { name: "\u200B", value: "Value", inline: true },
 { name: "\u200B", value: "Winner", inline: true },
 
 { name: "Player", value: `${stats1.username}#${stats1.tag}\n${stats2.username}#${stats2.tag}`, inline: true },
 { name: "Rating", value: `${stats1.stats.rating}\n${stats2.stats.rating}`, inline: true },
 { name: "\u200B", value: `${stats1.stats.rating > stats2.stats.rating ? "👑 P1" : stats2.stats.rating > stats1.stats.rating ? "👑 P2" : "🤝 Tie"}`, inline: true },
 
 { name: "\u200B", value: "K/D Ratio", inline: true },
 { name: "\u200B", value: `${kd1}\n${kd2}`, inline: true },
 { name: "\u200B", value: `${parseFloat(kd1) > parseFloat(kd2) ? "👑 P1" : parseFloat(kd2) > parseFloat(kd1) ? "👑 P2" : "🤝 Tie"}`, inline: true },
 
 { name: "\u200B", value: "Win Rate", inline: true },
 { name: "\u200B", value: `${winRate1}%\n${winRate2}%`, inline: true },
 { name: "\u200B", value: `${parseFloat(winRate1) > parseFloat(winRate2) ? "👑 P1" : parseFloat(winRate2) > parseFloat(winRate1) ? "👑 P2" : "🤝 Tie"}`, inline: true },
 
 { name: "\u200B", value: "Headshots", inline: true },
 { name: "\u200B", value: `${stats1.stats.headshots}\n${stats2.stats.headshots}`, inline: true },
 { name: "\u200B", value: `${stats1.stats.headshots > stats2.stats.headshots ? "👑 P1" : stats2.stats.headshots > stats1.stats.headshots ? "👑 P2" : "🤝 Tie"}`, inline: true },
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