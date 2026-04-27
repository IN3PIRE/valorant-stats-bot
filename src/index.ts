import { Client, Collection, Events, GatewayIntentBits, Interaction, REST, Routes } from "discord.js";
import logger from "./logger";
import { CONFIG } from "./config";
import path from "path";
import fs from "fs/promises";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection<string, any>();

async function loadCommands() {
 const commandsPath = path.join(import.meta.dirname, "commands");
 const files = await fs.readdir(commandsPath);
 const commandData = [];
 for (const file of files) {
 if (!file.endsWith(".ts")) continue;
 const modulePath = path.join(commandsPath, file);
 const command = await import(modulePath);
 client.commands.set(command.data.name, command);
 commandData.push(command.data.toJSON());
 }
 const rest = new REST({ version: "10" }).setToken(CONFIG.DISCORD_TOKEN);
 try {
 logger.info("Started refreshing application (/) commands.");
 await rest.put(Routes.applicationCommands(client.user!.id), { body: commandData });
 logger.info("Successfully reloaded application (/) commands.");
 } catch (error) {
 logger.error("Error registering commands: %s", (error as any).message);
 }
}

client.once(Events.ClientReady, async () => {
 logger.info("Bot logged in as %s", client.user!.tag);
 await loadCommands();
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
 if (!interaction.isChatInputCommand()) return;
 const command = client.commands.get(interaction.commandName);
 if (!command) return;
 try {
 await command.execute(interaction);
 } catch (error) {
 logger.error("Command execution error: %s", (error as any).message);
 if (interaction.replied || interaction.deferred) {
 await interaction.editReply({ content: "❌ Something went wrong while executing the command.", embeds: [] });
 } else {
 await interaction.reply({ content: "❌ Something went wrong while executing the command.", ephemeral: true });
 }
 }
});

process.on("unhandledRejection", (reason) => {
 logger.error("Unhandled Rejection: %s", reason);
});
process.on("uncaughtException", (err) => {
 logger.error("Uncaught Exception: %s", err);
 process.exit(1);
});

client.login(CONFIG.DISCORD_TOKEN);
