require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const dayjs = require('dayjs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { authorizeAndFetch } = require('./helpers/weeklySchedule');
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

client.interactions = new Collection();
const interactionsPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

for (const file of interactionFiles) {
    const filePath = path.join(interactionsPath, file);
    const interaction = require(filePath);
    client.interactions.set(interaction.data.id, interaction);
}

exitProcess = () => {
    console.log('\n⏳ Stopping bot...');
    client.destroy();
    console.log(`✅ Bot stopped. Goodbye! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
}

client.once('ready', async () => {
    await authorizeAndFetch();
    console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
});

process.on('SIGINT', () => exitProcess());

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() || interaction.isButton()) {
        const command = client.commands.get(interaction.commandName);
        const interactionCommand = client.interactions.get(interaction.customId);

        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interactionCommand) {
            try {
                await interactionCommand.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this interaction!', ephemeral: true });
            }
        }
    }
    else {
        console.log('Received an interaction that is not a command or button!');
    }
});

client.login(process.env.DISCORD_TOKEN);