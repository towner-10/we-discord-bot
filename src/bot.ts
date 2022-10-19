import dotenv from 'dotenv';
dotenv.config();

import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import { Client, Collection, GatewayIntentBits, Interaction } from 'discord.js';
import { Command } from './types/command';

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

const commands = new Collection<string, Command>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    import(filePath).then((command: Command) => {
        commands.set(command.data.name, command);
    });
}

const exitProcess = () => {
    console.log('\n⏳ Stopping bot...');
    client.destroy();
    console.log(`✅ Bot stopped. Goodbye! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
}

client.once('ready', async () => {
    console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
});

process.on('SIGINT', () => exitProcess());

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);

    try {
        await command?.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);