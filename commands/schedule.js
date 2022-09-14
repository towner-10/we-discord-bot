const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getWeek, getScheduleData } = require('../helpers/weeklySchedule.js');

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

                        const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe);

                        switch (interaction.options.getString('class')) {
                                case 'bus':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Business`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Business") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'phys':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Physics`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Physics") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'statics':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Statics`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Statics") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'design':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Design`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Design") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'chem':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Chemistry`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Chemistry") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'mats':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Materials`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Materials") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'lin-alg':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Linear Algebra`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Linear Algebra") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                case 'prog':
                                        // Generate embed for the schedule
                                        scheduleEmbed.setTitle(`Programming`);

                                        // Create a list of all of the schedule items
                                        data.forEach(classElement => {
                                                if (classElement.class === "Programming") {
                                                        let scheduleItems = "";
                                                        classElement.items.forEach(item => {
                                                                scheduleItems += (item + "\n");
                                                        });
                                                        scheduleEmbed.setDescription(scheduleItems);
                                                }
                                        });

                                        await interaction.reply({ embeds: [scheduleEmbed] })
                                        break;
                                default:
                                        await interaction.reply({ content: 'Couldn\'t send the requested weekly schedule! Try again later.', ephemeral: true });
                        }
                }
        },
};