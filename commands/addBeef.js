const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addBeef } = require('../helpers/beefManager.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('add-beef')
                .setDescription('add da beef')
                .addStringOption(option => option.setName('user-1').setDescription('Participant #1').setRequired(true))
                .addStringOption(option => option.setName('user-2').setDescription('Participant #2').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                // Check if the user has the correct role
                if (!interaction.member.roles.cache.some(role => role.name === process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'You don\'t have the correct role to do this!', ephemeral: true });

                // Check response to see if data was successfully added to the file
                const added = await addBeef(interaction.options.getString('user-1'), interaction.options.getString('user-2'));

                if (added === true) {
                        await interaction.reply({ content: 'Added da beef!', ephemeral: true });
                } else {
                        await interaction.reply({ content: 'Didn\'t add da beef! Try again later.', ephemeral: true });
                }
        },
};