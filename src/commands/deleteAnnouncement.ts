import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";
import Database from "../helpers/database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-announcement')
        .setDescription('Delete a new announcement')
        .addIntegerOption(
            (option) => option
                .setName('id')
                .setDescription('The ticket ID of the announcement')
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        if (!interaction.guild) return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

        const id = interaction.options.get('id')?.value as number;

        const announcement = await Database.getInstance().getAnnouncement(id);

        if (announcement === null) return await interaction.reply({ content: `Could not find announcement with ticket ID: ${id}`, ephemeral: true });
        if (announcement.user !== interaction.user.id) return await interaction.reply({ content: `You do not have permission to delete this announcement.`, ephemeral: true });

        await AnnouncementManager.getInstance().deleteAnnouncement(Number(id), interaction.guild);

        return await interaction.reply({ content: `Deleted announcement with ticket ${id}.`, ephemeral: true });
    }
}