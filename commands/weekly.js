const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { setWeek, getWeek,  authorizeAndFetch } = require('../helpers/weeklySchedule.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('weekly')
                .setDescription('Set the current week for the schedule and post the weekly schedule to the current channel')
                .addIntegerOption(option => option.setName('week').setDescription('The week number into the current school year').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                // Check if the user has the correct role
                if (!interaction.member.roles.cache.some(role => role.name === process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'You don\'t have the correct role to do this!', ephemeral: true });

                // Check response to see if data was successfully added to the file
                const added = await setWeek(interaction.options.getInteger('week'));

                if (added === true) {
                        await interaction.reply({ content: `Updated the current week to ${interaction.options.getInteger('week')}!`, ephemeral: true });
                        const data = await authorizeAndFetch();
                        if (data.length > 0) {

                            // Generate embed for the schedule with all classes
                            let scheduleEmbed = new EmbedBuilder().setTitle(`Week ${getWeek()}`).setColor(0x9a6dbe);
                            let fields = [];

                            // Create a list of all of the schedule items for each class
                            data.forEach(classElement => {
                                let scheduleItems = "";
                                classElement.items.forEach(item => {
                                    scheduleItems += (item + "\n");
                                });
                                fields.push({ name: classElement.class, value: scheduleItems });
                            });

                            scheduleEmbed.addFields(fields);
                            await interaction.followUp({embeds: [scheduleEmbed]});
                        }
                        else {
                            await interaction.reply({ content: 'Could not send weekly schedule! A fatal error has occurred, check console.', ephemeral: true });
                        }
                } else {
                        await interaction.reply({ content: 'Could not update the current week! Try again later.', ephemeral: true });
                }
        },
};