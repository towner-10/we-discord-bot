import { CommandInteraction, SlashCommandBuilder } from "discord.js";
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
        const id = interaction.options.get('id')?.value as number;

        const announcement = await Database.getInstance().getAnnouncement(id);

        if (announcement === null) return await interaction.reply({ content: `Could not find announcement with ticket ID: ${id}`, ephemeral: true });
        if (announcement.user !== interaction.user.id) return await interaction.reply({ content: `You do not have permission to delete this announcement.`, ephemeral: true });

        await Database.getInstance().deleteAnnouncement(id);

        return await interaction.reply({ content: `Deleted announcement with ticket ${id}.`, ephemeral: true });
    }
}