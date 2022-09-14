const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBeef } = require('../helpers/beefManager.js');

let beefEmbed = new EmbedBuilder()
    .setTitle('Beef Counter')
    .setDescription('track da beef')
    .setColor(0x9a6dbe)
    .setThumbnail('https://cdn.britannica.com/68/143268-050-917048EA/Beef-loin.jpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beef-counter')
        .setDescription('track da beef'),
    async execute(interaction) {
        let fields = [];
        getBeef().forEach(beef => {
            fields.push({ name: `Round ${beef["id"]}`, value: `${beef["user-1"]} VS ${beef["user-2"]}` });
        });
        beefEmbed.addFields(fields);
        await interaction.reply({ embeds: [beefEmbed] });
    },
};