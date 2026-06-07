import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runTelemetry } from "./telemetry.js";
import { handlePrefixCommand, allCommands } from "./prefix.js";
import { registerSlashCommands, handleSlashCommand } from "./slash-comands.js";
import { setupWelcomeEvents } from "../eventos/help_welcome_mensaje.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.envs/bot.env") });
dotenv.config({ path: path.resolve(__dirname, "../.envs/ai.env") });

if (!process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN.includes("EDAe7w") /* Check for default placeholder */) {
    console.error("[!] ERROR: DISCORD_BOT_TOKEN no parece estar configurado correctamente en .envs/bot.env");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", async () => {
    console.log(`[+] Bot conectado como: ${client.user.tag}`);
    runTelemetry(client);
    await registerSlashCommands(client, allCommands);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    await handlePrefixCommand(message);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    await handleSlashCommand(interaction);
});

setupWelcomeEvents(client);

client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
    console.error("[!] Error al iniciar sesión en Discord:", err);
});
