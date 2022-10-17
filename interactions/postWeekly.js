const { ButtonInteraction } = require("discord.js");
const { createEmbed } = require("../helpers/weeklySchedule");

/**
 * Post the weekly schedule to the channel.
 */
module.exports = {
    data: {
        id: 'post-weekly',
    },
    async execute(interaction) {
        if (interaction instanceof ButtonInteraction) {
            return await interaction.reply({ embeds: [await createEmbed()] });
        }
    }
}