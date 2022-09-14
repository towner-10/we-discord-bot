const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWeek, getScheduleData } = require('../helpers/weeklySchedule.js');

generateEmbed = (data, className) => {
        const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe);

        // Generate embed for the schedule
        scheduleEmbed.setTitle(`${className} - Week ${getWeek()}`);

        // Create a list of all of the schedule items
        data.forEach(classElement => {
                if (classElement.class === className) {
                        let scheduleItems = '';
                        classElement.items.forEach(item => {
                                scheduleItems += (item + '\n');
                        });
                        scheduleEmbed.setDescription(scheduleItems);
                }
        });

        return scheduleEmbed;
}

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

                        if (data.length === 0 || data === null) return await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });

                        // Depending on the class, create and send an embed for that classes schedule for the current week.
                        switch (interaction.options.getString('class')) {
                                case 'bus':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Business')] })
                                        break;
                                case 'phys':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Physics')] })
                                        break;
                                case 'calc':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Calculus')] })
                                        break;
                                case 'statics':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Statics')] })
                                        break;
                                case 'design':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Design')] })
                                        break;
                                case 'chem':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Chemistry')] })
                                        break;
                                case 'mats':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Materials')] })
                                        break;
                                case 'lin-alg':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Linear Algebra')] })
                                        break;
                                case 'prog':
                                        await interaction.reply({ embeds: [generateEmbed(data, 'Programming')] })
                                        break;
                                default:
                                        await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });
                        }
                }
        },
};