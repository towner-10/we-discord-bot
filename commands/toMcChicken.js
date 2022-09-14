const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('to-mcchicken')
        .setDescription('Calculate the number of McChickens your financial decisions are equivalent to.')
        .addNumberOption(option => option.setMinValue(0).setRequired(true).setName("cost").setDescription("The cost of the item(s) in $CAD")),
	async execute(interaction) {
		await interaction.reply(`That is equivalent to ${(interaction.options.getNumber("cost") / 6.19).toFixed(2)} McChickens! Maybe it\'s time to reconsider your financial choices.`);
	},
};