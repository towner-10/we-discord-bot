import dayjs from "dayjs";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Database from "../helpers/database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-announcement')
        .setDescription('Get an announcement')
        .addIntegerOption(
            (option) => option
                .setName('id')
                .setDescription('The ticket ID of the announcement')
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        const id = interaction.options.get('id')?.value as number;

        const announcement = await Database.getInstance().getAnnouncement(id);

        if (announcement === null) return await interaction.reply({ content: `Could not find announcement with ticket ID: ${id}`, ephemeral: true });
        if (announcement.user !== interaction.user.id) return await interaction.reply({ content: `You do not have permission to delete this announcement.`, ephemeral: true });

        return await interaction.reply({ embeds: [
            new EmbedBuilder()
                .setDescription(`**${announcement.description}**\n\n${announcement.content}`)
                .setTitle(announcement.title)
                .setAuthor({name: (await interaction.client.users.fetch(announcement.user)).username})
                .setTimestamp(announcement.createdAt)
                .setImage(announcement.image)
        ], ephemeral: true });
    }
}