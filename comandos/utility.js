import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { helpWelcomeEmbed } from "../eventos/help_welcome_mensaje.js";

function resolveMember(message, arg) {
    if (!arg) return message.member;
    const matches = arg.match(/^<@!?(\d+)>$/);
    return message.guild.members.cache.get(matches ? matches[1] : arg) || message.member;
}

export const utilityCommands = [
    {
        name: "userinfo",
        description: "Muestra información de un usuario del servidor.",
        aliases: ["user", "usuario"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Usuario").setRequired(false));
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario") || interaction.user;
            const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
            if (!member) return interaction.reply({ content: "❌ No encontrado.", ephemeral: true });
            const roles = member.roles.cache.filter(r => r.name !== "@everyone").map(r => r.toString()).join(", ") || "Ninguno";
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Información de ${user.tag}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL({ size: 512 }))
                .setColor("#5865F2")
                .addFields(
                    { name: "👤 Usuario", value: `\`${user.username}\``, inline: true },
                    { name: "🆔 ID", value: `\`${user.id}\``, inline: true },
                    { name: "📅 Creado el", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: "📥 Unido el", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                    { name: "🎭 Roles", value: roles }
                )
                .setFooter({ text: `Consultado por ${interaction.user.tag}` });
            await interaction.reply({ embeds: [embed] });
        },
        async executePrefix(message, args) {
            const member = resolveMember(message, args[0]);
            const user = member.user;
            const roles = member.roles.cache.filter(r => r.name !== "@everyone").map(r => r.toString()).join(", ") || "Ninguno";
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Información de ${user.tag}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL({ size: 512 }))
                .setColor("#5865F2")
                .addFields(
                    { name: "👤 Usuario", value: `\`${user.username}\``, inline: true },
                    { name: "🆔 ID", value: `\`${user.id}\``, inline: true },
                    { name: "📅 Creado el", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: "📥 Unido el", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                    { name: "🎭 Roles", value: roles }
                )
                .setFooter({ text: `Consultado por ${message.author.tag}` });
            await message.reply({ embeds: [embed] });
        }
    },
    {
        name: "serverinfo",
        description: "Muestra información del servidor.",
        aliases: ["server", "servidor"],
        slashBuilder() {
            return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
        },
        async executeSlash(interaction) {
            const { guild } = interaction;
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const embed = new EmbedBuilder()
                .setTitle(`Información de ${guild.name}`)
                .setThumbnail(guild.iconURL({ size: 512 }))
                .setColor("#5865F2")
                .addFields(
                    { name: "🆔 ID", value: `\`${guild.id}\``, inline: true },
                    { name: "👑 Propietario", value: `${owner}`, inline: true },
                    { name: "📅 Creado", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: "👥 Miembros", value: `\`${guild.memberCount}\``, inline: true },
                    { name: "🎭 Roles", value: `\`${guild.roles.cache.size}\``, inline: true },
                    { name: "💬 Canales", value: `Txt: \`${channels.filter(c => c.type === 0).size}\` | Voz: \`${channels.filter(c => c.type === 2).size}\``, inline: false }
                );
            await interaction.reply({ embeds: [embed] });
        },
        async executePrefix(message, args) {
            const { guild } = message;
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const embed = new EmbedBuilder()
                .setTitle(`Información de ${guild.name}`)
                .setThumbnail(guild.iconURL({ size: 512 }))
                .setColor("#5865F2")
                .addFields(
                    { name: "🆔 ID", value: `\`${guild.id}\``, inline: true },
                    { name: "👑 Propietario", value: `${owner}`, inline: true },
                    { name: "📅 Creado", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: "👥 Miembros", value: `\`${guild.memberCount}\``, inline: true },
                    { name: "🎭 Roles", value: `\`${guild.roles.cache.size}\``, inline: true },
                    { name: "💬 Canales", value: `Txt: \`${channels.filter(c => c.type === 0).size}\` | Voz: \`${channels.filter(c => c.type === 2).size}\``, inline: false }
                );
            await message.reply({ embeds: [embed] });
        }
    },
    {
        name: "avatar",
        description: "Muestra el avatar ampliado.",
        aliases: ["foto", "icon"],
        slashBuilder() {
            return new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(opt => opt.setName("usuario").setDescription("Usuario").setRequired(false));
        },
        async executeSlash(interaction) {
            const user = interaction.options.getUser("usuario") || interaction.user;
            await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`🖼️ Avatar de ${user.tag}`).setImage(user.displayAvatarURL({ size: 1024, dynamic: true })).setColor("#5865F2")] });
        },
        async executePrefix(message, args) {
            const member = resolveMember(message, args[0]);
            await message.reply({ embeds: [new EmbedBuilder().setTitle(`🖼️ Avatar de ${member.user.tag}`).setImage(member.user.displayAvatarURL({ size: 1024, dynamic: true })).setColor("#5865F2")] });
        }
    },
    {
        name: "help",
        description: "Muestra la ayuda.",
        aliases: ["ayuda"],
        slashBuilder() { return new SlashCommandBuilder().setName(this.name).setDescription(this.description); },
        async executeSlash(interaction) { await interaction.reply({ embeds: helpWelcomeEmbed.embeds, components: helpWelcomeEmbed.components }); },
        async executePrefix(message, args) { await message.reply({ embeds: helpWelcomeEmbed.embeds, components: helpWelcomeEmbed.components }); }
    }
];
