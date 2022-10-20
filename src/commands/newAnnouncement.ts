import dayjs from "dayjs";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, ModalBuilder, SlashCommandBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import Database from "../helpers/database";

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
                const announcement = await Database.getInstance().createAnnouncement(title, description, content, interaction.user.id, image?.url);

                if (announcement === null) return await submitted.reply({ content: `Could not create announcement.`, ephemeral: true });

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId(`send-announcement-${announcement.id}`).setLabel('Post Announcement').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`delete-announcement-${announcement.id}`).setLabel('Delete Announcement').setStyle(ButtonStyle.Secondary),
                );

                if (!interaction.guild?.channels.cache.find(channel => channel.name === 'announcement-tickets')) {
                    const newChannel = await interaction.guild?.channels.create({
                        name: 'announcement-tickets',
                        type: ChannelType.GuildText,
                        topic: 'Announcement tickets are created here.',
                        reason: 'Announcement tickets channel does not exist.'
                    });

                    newChannel?.send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`**${announcement.description}**\n\n${announcement.content}`)
                                .setTitle(announcement.title)
                                .setAuthor({ name: (await interaction.client.users.fetch(announcement.user)).username })
                                .setTimestamp(announcement.createdAt)
                                .setImage(image?.url ?? null)
                        ],
                        components: [row]
                    });
                } else {
                    const channel = interaction.guild?.channels.cache.find(channel => channel.name === 'announcement-tickets') as TextChannel;

                    try {
                        channel?.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`**${announcement.description}**\n\n${announcement.content}`)
                                    .setTitle(announcement.title)
                                    .setAuthor({ name: (await interaction.client.users.fetch(announcement.user)).username })
                                    .setTimestamp(announcement.createdAt)
                                    .setImage(image?.url ?? null)
                            ],
                            components: [row]
                        });
                    }
                    catch (error) {
                        console.log(error);
                        return await submitted.reply({ content: `Could not create announcement. Ask admin to check announcement tickets channel permissions.`, ephemeral: true });
                    }
                }

                // TODO: Create collectors on ready event to listen for button interactions and delete announcements
                const channel = interaction.guild?.channels.cache.find(channel => channel.name === 'announcement-tickets') as TextChannel;

                const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

                collector?.on('collect', async (buttonInteraction: ButtonInteraction<CacheType>) => {
                    if (buttonInteraction.user.id === interaction.user.id) {
                        switch (buttonInteraction.customId) {
                            case `send-announcement-${announcement.id}`:
                                await buttonInteraction.update({ content: 'Posting the announcement...' });
                                return;
                            case `delete-announcement-${announcement.id}`:
                                await buttonInteraction.update({ content: "Deleting the announcement..." })
                                if (await Database.getInstance().deleteAnnouncement(announcement.id) !== null) {
                                    await buttonInteraction.deleteReply();
                                }
                                return;
                        }
                        console.log("Button interaction not handled");
                    }
                });

                return await submitted.reply({ content: `Created announcement. The announcement ticket is ${announcement?.id} and was created at: ${dayjs(announcement?.createdAt).format('YYYY-MM-DD h:mm:ss')}`, ephemeral: true });
            }
        }

        return await interaction.followUp({ content: `Timed out.`, ephemeral: true });
    }
}