import dayjs from "dayjs";
import { ActionRowBuilder, CommandInteraction, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-announcement')
        .setDescription('Create a new announcement')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('An image to include with the announcement')
                .setRequired(false)),
    async execute(interaction: CommandInteraction) {
        const image = interaction.options.get('image')?.attachment;

        const titleInput = new TextInputBuilder()
            .setCustomId('announcement-title')
            .setPlaceholder('Title')
            .setStyle(TextInputStyle.Short)
            .setLabel('Title')
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('announcement-description')
            .setPlaceholder('Description')
            .setStyle(TextInputStyle.Short)
            .setLabel('Description')
            .setRequired(true);

        const contentInput = new TextInputBuilder()
            .setCustomId('announcement-content')
            .setPlaceholder('Announcement content')
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Content')
            .setRequired(true);

        const modal = new ModalBuilder()
            .setCustomId('new-announcement-modal')
            .setTitle('New Announcement')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput)
            );

        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: (modalInteraction) => modalInteraction.user.id === interaction.user.id
        }).catch(() => {
            return null;
        });

        if (submitted) {
            const title = submitted.fields.getTextInputValue('announcement-title');
            const description = submitted.fields.getTextInputValue('announcement-description');
            const content = submitted.fields.getTextInputValue('announcement-content');

            if (title && description && content) {
                if (!interaction.guild) return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

                const announcement = await AnnouncementManager.getInstance().createAnnouncement(title, description, content, interaction.user, interaction.guild, image);

                if (announcement === null) return await submitted.reply({ content: `Could not create announcement.`, ephemeral: true });

                return await submitted.reply({ content: `Created announcement. The announcement ticket is ${announcement?.id} and was created at: ${dayjs(announcement?.createdAt).format('YYYY-MM-DD h:mm:ss')}`, ephemeral: true });
            }
        }

        return await interaction.followUp({ content: `Timed out.`, ephemeral: true });
    }
}