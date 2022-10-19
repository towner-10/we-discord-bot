import { SlashCommandBuilder, CommandInteraction, SlashCommandNumberOption } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
        .setName('to-mcchicken')
        .setDescription('Calculate the number of McChickens your financial decisions are equivalent to.')
        .addNumberOption((option: SlashCommandNumberOption) => option.setMinValue(0).setRequired(true).setName("cost").setDescription("The cost of the item(s) in $CAD")),
	async execute(interaction: CommandInteraction) {
		await interaction.reply(`That is equivalent to ${(interaction.options.get("cost")?.value as number / 6.19).toFixed(2)} McChickens! Maybe it's time to reconsider your financial choices.`);
	},
};