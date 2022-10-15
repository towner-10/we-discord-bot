const { ButtonInteraction } = require("discord.js");
const { authorizeAndFetch, createEmbed } = require("../helpers/weeklySchedule");

/**
 * Post the weekly schedule to the channel.
 */
module.exports = {
    data: {
        id: 'post-weekly',
    },
    async execute(interaction) {
        if (interaction instanceof ButtonInteraction) {
            const data = await authorizeAndFetch();

            if (data.length > 0) return await interaction.reply({ embeds: [createEmbed()] });
            return await interaction.reply({ content: 'Could not send weekly schedule! A fatal error has occurred, check console.', ephemeral: true });
        }
    }
}