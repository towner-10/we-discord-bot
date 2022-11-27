import { CommandInteraction, GuildMemberRoleManager, SlashCommandIntegerOption, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction, CacheType } from "discord.js";
import { logger } from "../helpers/logging";
import { createEmbed } from '../helpers/weeklySchedule';
import Database from "../helpers/database";

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

                // Check if the interaction is in a guild
                if (!interaction.guild || !interaction.guildId) return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

                // Check response to see if data was successfully added to the file
                const guild = await Database.getInstance().guilds.currentWeek.set(interaction.guildId, interaction.options.get('week')?.value as number);

                if (guild) {
                        // Create the buttons
                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('post-weekly').setLabel('Post Schedule').setStyle(ButtonStyle.Primary),
                                new ButtonBuilder().setCustomId('test-weekly').setLabel('Test Schedule').setStyle(ButtonStyle.Secondary),
                        );

                        await interaction.reply({ content: `Updated the current week to ${interaction.options.get('week')?.value}!`, ephemeral: true, components: [row], fetchReply: true });

                        const collector = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

                        collector?.on('collect', async (buttonInteraction: ButtonInteraction<CacheType>) => {
                                if (buttonInteraction.user.id === interaction.user.id) {
                                        switch (buttonInteraction.customId) {
                                                case 'post-weekly':
                                                        await buttonInteraction.update({ content: 'Posting the schedule...' });
                                                        await interaction.channel?.send({ embeds: [await createEmbed(guild.guildId)] });
                                                        return;
                                                case 'test-weekly':
                                                        await buttonInteraction.update({ content: "This is what the schedule will look like...", embeds: [await createEmbed(guild.guildId)] });
                                                        return;
                                        }
                                        logger.warn(`Unknown button id: ${buttonInteraction.customId}`);
                                }
                        });
                } else {
                        await interaction.reply({ content: 'Could not update the current week! Try again later.', ephemeral: true });
                }
        },
};