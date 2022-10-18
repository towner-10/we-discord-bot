const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../helpers/weeklySchedule.js');

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
                // If the user did not provide a class, return an the entire schedule
                if (!interaction.options.getString('class')) {
                        return await interaction.reply({ embeds: [await createEmbed()] });
                }

                // Depending on the class, create and send an embed for that classes schedule for the current week.
                switch (interaction.options.getString('class')) {
                        case 'bus':
                                return await interaction.reply({ embeds: [await createEmbed('Business')] });
                        case 'phys':
                                return await interaction.reply({ embeds: [await createEmbed('Physics')] });
                        case 'calc':
                                return await interaction.reply({ embeds: [await createEmbed('Calculus')] });
                        case 'statics':
                                return await interaction.reply({ embeds: [await createEmbed('Statics')] });
                        case 'design':
                                return await interaction.reply({ embeds: [await createEmbed('Design')] });
                        case 'chem':
                                return await interaction.reply({ embeds: [await createEmbed('Chemistry')] });
                        case 'mats':
                                return await interaction.reply({ embeds: [await createEmbed('Materials')] });
                        case 'lin-alg':
                                return await interaction.reply({ embeds: [await createEmbed('Linear Algebra')] });
                        case 'prog':
                                return await interaction.reply({ embeds: [await createEmbed('Programming')] });
                        default:
                                return await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });
                }
        },
};