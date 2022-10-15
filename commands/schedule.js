const { SlashCommandBuilder } = require('discord.js');
const { getScheduleData, createEmbed } = require('../helpers/weeklySchedule.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('schedule')
                .setDescription('Get the schedule for the class you choose')
                .addStringOption(option => option
                        .setName('class')
                        .setDescription('The week number into the current school year')
                        .addChoices(
                                { name: 'Business', value: 'bus' },
                                { name: 'Physics', value: 'phys' },
                                { name: 'Calculus', value: 'calc' },
                                { name: 'Statics', value: 'statics' },
                                { name: 'Design', value: 'design' },
                                { name: 'Chemistry', value: 'chem' },
                                { name: 'Materials', value: 'mats' },
                                { name: 'Linear Algebra', value: 'lin-alg' },
                                { name: 'Programming', value: 'prog' },
                        )
                        .setRequired(true)
                ),
        async execute(interaction) {
                if (interaction.options.getString('class')) {

                        const data = getScheduleData();

                        if (data.length === 0) return await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });

                        // Depending on the class, create and send an embed for that classes schedule for the current week.
                        switch (interaction.options.getString('class')) {
                                case 'bus':
                                        await interaction.reply({ embeds: [createEmbed('Business')] });
                                        break;
                                case 'phys':
                                        await interaction.reply({ embeds: [createEmbed('Physics')] });
                                        break;
                                case 'calc':
                                        await interaction.reply({ embeds: [createEmbed('Calculus')] });
                                        break;
                                case 'statics':
                                        await interaction.reply({ embeds: [createEmbed('Statics')] });
                                        break;
                                case 'design':
                                        await interaction.reply({ embeds: [createEmbed('Design')] });
                                        break;
                                case 'chem':
                                        await interaction.reply({ embeds: [createEmbed('Chemistry')] });
                                        break;
                                case 'mats':
                                        await interaction.reply({ embeds: [createEmbed('Materials')] });
                                        break;
                                case 'lin-alg':
                                        await interaction.reply({ embeds: [createEmbed('Linear Algebra')] });
                                        break;
                                case 'prog':
                                        await interaction.reply({ embeds: [createEmbed('Programming')] });
                                        break;
                                default:
                                        await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });
                        }
                }
        },
};