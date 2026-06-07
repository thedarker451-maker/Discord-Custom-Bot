import { SlashCommandBuilder } from "discord.js";

async function queryAI(prompt) {
    const provider = (process.env.AI_PROVIDER || "mistral").toLowerCase().trim();
    const apiKey = process.env.api_key ? process.env.api_key.trim() : "";
    const model = process.env.AI_MODEL ? process.env.AI_MODEL.trim() : "";

    if (!apiKey || apiKey.startsWith("#") || apiKey === "") {
        return `❌ **Error de configuración:** El API Key para la IA no está configurado.\nEdita \`.envs/ai.env\`.`;
    }

    try {
        if (provider === "mistral") {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                body: JSON.stringify({ model: model || "open-mixtral-8x7b", messages: [{ role: "user", content: prompt }] })
            });
            if (!response.ok) return `❌ **Error de la API de Mistral AI (${response.status}):**\n\`\`\`json\n${await response.text()}\n\`\`\``;
            return (await response.json()).choices?.[0]?.message?.content || "No hay respuesta.";

        } else if (provider === "gemini") {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-2.5-flash"}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) return `❌ **Error de la API de Google Gemini (${response.status}):**\n\`\`\`json\n${await response.text()}\n\`\`\``;
            return (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text || "No hay respuesta.";

        } else if (provider === "openai" || provider === "chatgpt") {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                body: JSON.stringify({ model: model || "gpt-4o-mini", messages: [{ role: "user", content: prompt }] })
            });
            if (!response.ok) return `❌ **Error de la API de OpenAI (${response.status}):**\n\`\`\`json\n${await response.text()}\n\`\`\``;
            return (await response.json()).choices?.[0]?.message?.content || "No hay respuesta.";
            
        } else {
            return `❌ **Error:** Proveedor de IA \`${provider}\` no soportado.`;
        }
    } catch (error) {
        return `❌ **Error de Red o Conexión al consultar la IA:** ${error.message}`;
    }
}

async function sendLongSlashResponse(interaction, text) {
    if (text.length <= 2000) return await interaction.editReply(text);
    const chunks = [];
    let current = text;
    while (current.length > 0) { chunks.push(current.substring(0, 1900)); current = current.substring(1900); }
    await interaction.editReply(chunks[0]);
    for (let i = 1; i < chunks.length; i++) await interaction.channel.send(chunks[i]);
}

export const aiCommands = [
    {
        name: "ask",
        description: "Hazle una pregunta al modelo de Inteligencia Artificial configurado.",
        aliases: ["preguntar", "ia"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(opt => opt.setName("pregunta").setDescription("La pregunta").setRequired(true));
        },
        async executeSlash(interaction) {
            const prompt = interaction.options.getString("pregunta");
            await interaction.deferReply();
            const answer = await queryAI(prompt);
            await sendLongSlashResponse(interaction, answer);
        },
        async executePrefix(message, args) {
            const prompt = args.join(" ");
            if (!prompt || prompt.trim() === "") return message.reply("❌ Por favor escribe tu pregunta.");
            const statusMsg = await message.reply("🤔 Procesando tu pregunta, por favor espera...");
            const answer = await queryAI(prompt);
            if (answer.length <= 2000) return await statusMsg.edit(answer);
            await statusMsg.edit(answer.substring(0, 2000));
            let current = answer.substring(2000);
            while (current.length > 0) { await message.channel.send(current.substring(0, 1900)); current = current.substring(1900); }
        }
    }
];
