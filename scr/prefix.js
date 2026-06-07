import { pingCommand } from "../comandos/ping.js";
import { cryptoCommands } from "../comandos/crypto.js";
import { aiCommands } from "../comandos/ai.js";
import { moderationCommands } from "../comandos/moderation.js";
import { utilityCommands } from "../comandos/utility.js";

export const allCommands = [
    ...pingCommand,
    ...cryptoCommands,
    ...aiCommands,
    ...moderationCommands,
    ...utilityCommands
];

export async function handlePrefixCommand(message) {
    const prefixes = (process.env.PREFIX || "!").split(",").map(p => p.trim());
    let prefixUsed = null;
    for (const p of prefixes) {
        if (message.content.startsWith(p)) {
            prefixUsed = p;
            break;
        }
    }
    
    if (!prefixUsed) return;
    
    const args = message.content.slice(prefixUsed.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = allCommands.find(cmd => 
        cmd.name === commandName || 
        (cmd.aliases && cmd.aliases.includes(commandName))
    );
    
    if (!command) return;
    
    if (typeof command.executePrefix === "function") {
        try {
            await command.executePrefix(message, args);
        } catch (error) {
            console.error(`Error al ejecutar el comando de prefijo "${commandName}":`, error);
            await message.reply("❌ Ocurrió un error al intentar ejecutar este comando.");
        }
    }
}
