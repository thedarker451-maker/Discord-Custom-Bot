import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

function resolveMember(message, arg) {
    if (!arg) return null;
    const matches = arg.match(/^<@!?(\d+)>$/);
    return message.guild.members.cache.get(matches ? matches[1] : arg) || null;
}

export const moderationCommands = [
    {
        name: "kick",
        description: "Expulsa a un miembro del servidor.",
        aliases: ["expulsar"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Miembro a expulsar").setRequired(true))
                .addStringOption(opt => opt.setName("razon").setDescription("Razón").setRequired(false))
                .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario");
            const reason = interaction.options.getString("razon") || "No especificada";
            const member = interaction.guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: "❌ No está en el servidor.", ephemeral: true });
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            if (!member.kickable) return interaction.reply({ content: "❌ No puedo expulsar a este usuario.", ephemeral: true });
            await member.kick(reason);
            await interaction.reply({ content: `✅ **${user.tag}** expulsado. Razón: \`${reason}\`` });
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply("❌ No tengo permisos.");
            const member = resolveMember(message, args[0]);
            if (!member) return message.reply("❌ Menciona a un miembro válido.");
            if (!member.kickable) return message.reply("❌ No puedo expulsarlo.");
            const reason = args.slice(1).join(" ") || "No especificada";
            await member.kick(reason);
            await message.reply(`✅ **${member.user.tag}** expulsado. Razón: \`${reason}\``);
        }
    },
    {
        name: "ban",
        description: "Banea a un miembro del servidor.",
        aliases: ["banear"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Miembro a banear").setRequired(true))
                .addStringOption(opt => opt.setName("razon").setDescription("Razón").setRequired(false))
                .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario");
            const reason = interaction.options.getString("razon") || "No especificada";
            const member = interaction.guild.members.cache.get(user.id);
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            if (member && !member.bannable) return interaction.reply({ content: "❌ No puedo banear a este usuario.", ephemeral: true });
            await interaction.guild.members.ban(user.id, { reason });
            await interaction.reply({ content: `✅ **${user.tag}** baneado. Razón: \`${reason}\`` });
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("❌ No tengo permisos.");
            if (!args[0]) return message.reply("❌ Menciona a un usuario o ID.");
            const matches = args[0].match(/^<@!?(\d+)>$/);
            const userId = matches ? matches[1] : args[0];
            const member = message.guild.members.cache.get(userId);
            if (member && !member.bannable) return message.reply("❌ No puedo banear a este usuario.");
            const reason = args.slice(1).join(" ") || "No especificada";
            await message.guild.members.ban(userId, { reason });
            await message.reply(`✅ Usuario **${userId}** baneado. Razón: \`${reason}\``);
        }
    },
    {
        name: "unban",
        description: "Remueve el baneo de un usuario por su ID.",
        aliases: ["desbanear"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(opt => opt.setName("id_usuario").setDescription("ID").setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
        },
        async executeSlash(interaction) {
            const userId = interaction.options.getString("id_usuario");
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            try { await interaction.guild.members.unban(userId); await interaction.reply(`✅ Baneo de **${userId}** removido.`); }
            catch { await interaction.reply({ content: "❌ No se encontró baneo.", ephemeral: true }); }
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("❌ No tengo permisos.");
            const userId = args[0];
            if (!userId) return message.reply("❌ Proporciona la ID.");
            try { await message.guild.members.unban(userId); await message.reply(`✅ Baneo de **${userId}** removido.`); }
            catch { await message.reply("❌ No se pudo desbanear."); }
        }
    },
    {
        name: "timeout",
        description: "Aplica un silencio temporal (timeout) a un usuario.",
        aliases: ["silenciar", "mute"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Miembro").setRequired(true))
                .addIntegerOption(opt => opt.setName("duracion").setDescription("Minutos").setRequired(true))
                .addStringOption(opt => opt.setName("razon").setDescription("Razón").setRequired(false))
                .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario");
            const duration = interaction.options.getInteger("duracion");
            const reason = interaction.options.getString("razon") || "No especificada";
            const member = interaction.guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: "❌ No está en el servidor.", ephemeral: true });
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            if (!member.moderatable) return interaction.reply({ content: "❌ No puedo silenciarlo.", ephemeral: true });
            await member.timeout(duration * 60 * 1000, reason);
            await interaction.reply({ content: `✅ **${user.tag}** silenciado por \`${duration} minutos\`.` });
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ No tengo permisos.");
            const member = resolveMember(message, args[0]);
            const duration = parseInt(args[1]);
            if (!member || isNaN(duration) || duration <= 0) return message.reply("❌ Uso: `!timeout <@usuario> <minutos>`");
            if (!member.moderatable) return message.reply("❌ No puedo silenciarlo.");
            await member.timeout(duration * 60 * 1000, args.slice(2).join(" ") || "No especificada");
            await message.reply(`✅ **${member.user.tag}** silenciado por \`${duration} minutos\`.`);
        }
    },
    {
        name: "untimeout",
        description: "Remueve el silencio temporal (timeout) de un usuario.",
        aliases: ["quitar_silencio", "unmute"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Miembro").setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario");
            const member = interaction.guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: "❌ No está en el servidor.", ephemeral: true });
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            await member.timeout(null);
            await interaction.reply({ content: `✅ Silencio removido de **${user.tag}**.` });
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ No tengo permisos.");
            const member = resolveMember(message, args[0]);
            if (!member) return message.reply("❌ Menciona a un miembro.");
            await member.timeout(null);
            await message.reply(`✅ Silencio removido de **${member.user.tag}**.`);
        }
    },
    {
        name: "clear",
        description: "Elimina masivamente mensajes de este canal.",
        aliases: ["purge", "limpiar", "borrar"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addIntegerOption(opt => opt.setName("cantidad").setDescription("Cantidad (1-100)").setRequired(true).setMinValue(1).setMaxValue(100))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
        },
        async executeSlash(interaction) {
            const amount = interaction.options.getInteger("cantidad");
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: "❌ No tengo permisos.", ephemeral: true });
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `🧹 Se eliminaron \`${deleted.size}\` mensajes.`, ephemeral: true });
        },
        async executePrefix(message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply("❌ No tienes permisos.");
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply("❌ No tengo permisos.");
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("❌ Usa `!clear <1-100>`");
            await message.channel.bulkDelete(amount + 1, true);
            const statusMsg = await message.channel.send(`🧹 Se eliminaron \`${amount}\` mensajes.`);
            setTimeout(() => statusMsg.delete().catch(() => {}), 4000);
        }
    }
];
