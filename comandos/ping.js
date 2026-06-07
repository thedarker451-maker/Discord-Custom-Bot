import { SlashCommandBuilder } from "discord.js";

export const pingCommand = [
    {
        name: "ping",
        description: "Calcula y muestra la latencia del bot y de la API de Discord.",
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description);
        },
        async executeSlash(interaction) {
            const start = Date.now();
            await interaction.reply({ content: "🏓 Buscando señal...", fetchReply: true });
            const latency = Date.now() - start;
            const apiPing = Math.round(interaction.client.ws.ping);
            
            await interaction.editReply(
                `🏓 **¡Pong!**\n` +
                `• **Latencia del Bot:** \`${latency}ms\`\n` +
                `• **Latencia API Discord:** \`${apiPing}ms\``
            );
        },
        async executePrefix(message, args) {
            const start = Date.now();
            const sentMessage = await message.reply("🏓 Buscando señal...");
            const latency = Date.now() - start;
            const apiPing = Math.round(message.client.ws.ping);
            
            await sentMessage.edit(
                `🏓 **¡Pong!**\n` +
                `• **Latencia del Bot:** \`${latency}ms\`\n` +
                `• **Latencia API Discord:** \`${apiPing}ms\``
            );
        }
    }
];
