const { ButtonInteraction } = require("discord.js");
const { createEmbed } = require("../helpers/weeklySchedule");

/**
 * Test the weekly schedule embed to make sure all of the data is correct.
 */
module.exports = {
    data: {
        id: 'test-weekly',
    },
    async execute(interaction) {
        if (interaction instanceof ButtonInteraction) {
            return await interaction.reply({ content: "This is what the schedule will look like...", embeds: [await createEmbed()], ephemeral: true });
        }
    }
}