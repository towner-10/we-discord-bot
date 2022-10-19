import { ActivityType, CommandInteraction, GuildMemberRoleManager, SlashCommandIntegerOption } from "discord.js";
import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction, CacheType } from 'discord.js';
import { setWeek, createEmbed, weekData } from '../helpers/weeklySchedule';

module.exports = {
        data: new SlashCommandBuilder()
                .setName('set-weekly')
                .setDescription('Set the current week for the schedule')
                .addIntegerOption((option: SlashCommandIntegerOption) => option.setName('week').setDescription('The week number into the current school year').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction: CommandInteraction) {
                // Check if the user has the correct role
                const roles = (interaction.member?.roles as GuildMemberRoleManager).cache;
                if (!roles.some(role => role.name === process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'You don\'t have the correct role to do this!', ephemeral: true });

                // Check response to see if data was successfully added to the file
                const added = await setWeek(interaction.options.get('week')?.value as number);

                if (added === true) {
                        // Create the buttons
                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('post-weekly').setLabel('Post Schedule').setStyle(ButtonStyle.Primary),
                                new ButtonBuilder().setCustomId('test-weekly').setLabel('Test Schedule').setStyle(ButtonStyle.Secondary),
                        );

                        await interaction.reply({ content: `Updated the current week to ${interaction.options.get('week')?.value}!`, ephemeral: true, components: [row], fetchReply: true });

                        interaction.client.user?.setActivity(`Week ${weekData.week}`, { type: ActivityType.Watching });

                        const collector = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

                        collector?.on('collect', async (buttonInteraction: ButtonInteraction<CacheType>) => {
                                if (buttonInteraction.user.id === interaction.user.id) {
                                        switch (buttonInteraction.customId) {
                                                case 'post-weekly':
                                                        await buttonInteraction.update({ content: 'Posting the schedule...' });
                                                        await interaction.channel?.send({ embeds: [await createEmbed()] });
                                                        return;
                                                case 'test-weekly':
                                                        await buttonInteraction.update({ content: "This is what the schedule will look like...", embeds: [await createEmbed()] });
                                                        return;
                                        }
                                        console.log("Button interaction not handled");
                                }
                        });
                } else {
                        await interaction.reply({ content: 'Could not update the current week! Try again later.', ephemeral: true });
                }
        },
};