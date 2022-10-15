const { ButtonInteraction } = require("discord.js");
const { authorizeAndFetch, createEmbed } = require("../helpers/weeklySchedule");

/**
 * Test the weekly schedule embed to make sure all of the data is correct.
 */
module.exports = {
    data: {
        id: 'test-weekly',
    },
    async execute(interaction) {
        if (interaction instanceof ButtonInteraction) {
            const data = await authorizeAndFetch();

            if (data.length > 0) return await interaction.reply({ content: "This is what the schedule will look like...", embeds: [createEmbed()], ephemeral: true });
            return await interaction.reply({ content: 'Could not send weekly schedule! A fatal error has occurred, check console.', ephemeral: true });
        }
    }
}