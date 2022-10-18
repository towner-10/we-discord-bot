const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { setWeek, createEmbed } = require('../helpers/weeklySchedule.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('set-weekly')
                .setDescription('Set the current week for the schedule')
                .addIntegerOption(option => option.setName('week').setDescription('The week number into the current school year').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                // Check if the user has the correct role
                if (!interaction.member.roles.cache.some(role => role.name === process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'You don\'t have the correct role to do this!', ephemeral: true });

                // Check response to see if data was successfully added to the file
                const added = await setWeek(interaction.options.getInteger('week'));

                if (added === true) {
                        // Create the buttons
                        const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('post-weekly').setLabel('Post Schedule').setStyle(ButtonStyle.Primary),
                                new ButtonBuilder().setCustomId('test-weekly').setLabel('Test Schedule').setStyle(ButtonStyle.Secondary),
                        );

                        await interaction.reply({ content: `Updated the current week to ${interaction.options.getInteger('week')}!`, ephemeral: true, components: [row] });

                        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

                        collector.on('collect', async i => {
                                if (i.user.id === interaction.user.id) {
                                        switch (i.customId) {
                                                case 'post-weekly':
                                                        await i.update({ content: 'Posting the schedule...', components: [] });
                                                        return await interaction.channel.send({ embeds: [await createEmbed()] });
                                                case 'test-weekly':
                                                        return await i.update({ content: "This is what the schedule will look like...", embeds: [await createEmbed()], ephemeral: true });
                                                default:
                                                        break;
                                        }
                                }
                        });
                } else {
                        await interaction.reply({ content: 'Could not update the current week! Try again later.', ephemeral: true });
                }
        },
};