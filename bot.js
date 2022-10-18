require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const dayjs = require('dayjs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildPresences
        ]
    });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

exitProcess = () => {
    console.log('\n⏳ Stopping bot...');
    client.destroy();
    console.log(`✅ Bot stopped. Goodbye! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
}

client.once('ready', async () => {
    console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
});

process.on('SIGINT', () => exitProcess());

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);