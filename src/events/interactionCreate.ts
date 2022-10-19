import { Events, Interaction } from "discord.js";
import { commands } from "../bot";

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const command = commands.get(interaction.commandName);

        try {
            await command?.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}