export const helpWelcomeEmbed = {
    "embeds": [
        {
            "title": "👋 | ¡Hola!",
            "description": "Soy tu nuevo bot de Discord. Muchas gracias por invitarme a tu servidor. Para no hacerte perder tiempo con introducciones innecesarias, aquí tienes la lista de comandos disponibles:\n\n" +
                "**🔍 UTILIDADES:**\n" +
                "• `/help` | `!help` - Muestra este panel de ayuda detallado.\n" +
                "• `/ping` | `!ping` - Muestra la latencia actual del bot.\n" +
                "• `/userinfo [@usuario]` | `!userinfo [@usuario]` - Muestra información de un usuario.\n" +
                "• `/serverinfo` | `!serverinfo` - Muestra detalles técnicos del servidor.\n" +
                "• `/avatar [@usuario]` | `!avatar [@usuario]` - Muestra el avatar de un usuario.\n\n" +
                "**🔐 CRIPTOGRAFÍA (Cifrado y descifrado):**\n" +
                "• `/encrypt <tipo> <texto>` | `!encrypt <tipo> <texto>`\n" +
                "• `/decrypt <tipo> <texto>` | `!decrypt <tipo> <texto>`\n" +
                "  *(Tipos: base64, hex, binary, rot13, caesar [desplazamiento])* \n\n" +
                "**🤖 INTELIGENCIA ARTIFICIAL:**\n" +
                "• `/ask <pregunta>` | `!ask <pregunta>` - Realiza preguntas al modelo de IA configurado.\n\n" +
                "**🛡️ MODERACIÓN:**\n" +
                "• `/kick <@usuario> [razón]` - Expulsa a un miembro del servidor.\n" +
                "• `/ban <@usuario> [razón]` - Banea a un miembro del servidor.\n" +
                "• `/unban <id_usuario>` - Remueve el baneo de un usuario.\n" +
                "• `/timeout <@usuario> <duración_minutos> [razón]` - Silencia a un miembro.\n" +
                "• `/untimeout <@usuario>` - Remueve el silencio de un miembro.\n" +
                "• `/clear <cantidad>` | `!clear <cantidad>` - Elimina masivamente mensajes de un canal.\n\n" +
                "Una muy pequeña introduccion a comandos, te dejare unos links que deberias chequearlos. ||@everyone||"
        }
    ],
    "components": [
        {
            "type": 1,
            "components": [
                {
                    "type": 2,
                    "style": 5,
                    "label": "Github Repo",
                    "emoji": {
                        "id": "1513285174950105278",
                        "name": "github_logop"
                    },
                    "url": "https://github.com/thedarker451-maker/Discord-Custom-Bot"
                },
                {
                    "type": 2,
                    "style": 5,
                    "label": "Check Ur Discord Server",
                    "emoji": {
                        "id": "1513286948649697424",
                        "name": "discord_emoji"
                    },
                    "url": "https://discord.gg/xAsDHMwjw7"
                }
            ]
        }
    ]
};

export function setupWelcomeEvents(client) {
    client.on("guildMemberAdd", async (member) => {
        if (process.env.WELCOME_MESSAGE_HELP === "false") {
            return;
        }

        try {
            const channel = member.guild.systemChannel || 
                member.guild.channels.cache.find(ch => 
                    ch.type === 0 &&
                    ch.permissionsFor(member.guild.members.me).has("SendMessages")
                );

            if (channel) {
                await channel.send({
                    content: `👋 ¡Hola ${member}, bienvenido/a a **${member.guild.name}**!`,
                    embeds: helpWelcomeEmbed.embeds,
                    components: helpWelcomeEmbed.components
                });
            }
        } catch (error) {
            console.error(`[!] Error al enviar mensaje de bienvenida en servidor "${member.guild.name}":`, error);
        }
    });
}
