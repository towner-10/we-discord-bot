import dayjs from "dayjs";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Database from "../helpers/database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-announcement')
        .setDescription('Create a new announcement')
        .addStringOption(
            (option) => option
                .setName('title')
                .setDescription('The title of the announcement')
                .setRequired(true)
        )
        .addStringOption(
            (option) => option
                .setName('description')
                .setDescription('The description of the announcement')
                .setRequired(true)
        )
        .addStringOption(
            (option) => option
                .setName('content')
                .setDescription('The content of the announcement')
                .setRequired(true)
        )
        .addAttachmentOption(
            (option) => option
                .setName('image')
                .setDescription('The image of the announcement')
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction) {
        const title = interaction.options.get('title')?.value as string;
        const description = interaction.options.get('description')?.value as string;
        const content = interaction.options.get('content')?.value as string;
        const image = interaction.options.get('image')?.value as string;

        const announcement = await Database.getInstance().createAnnouncement(title, description, content, interaction.user.id, image);

        if (announcement === null) return await interaction.reply({ content: `Could not create announcement.`, ephemeral: true });

        return await interaction.reply({ content: `Created announcement. The announcement ticket is ${announcement?.id} and was created at: ${dayjs(announcement?.createdAt).format('YYYY-MM-DD h:mm:ss')}`, ephemeral: true });
    }
}