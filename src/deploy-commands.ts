import fs from 'node:fs';
import path from 'node:path';
import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';
dotenv.config();

import { Command } from './types/command';

const commands: Command[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));

commandFiles.forEach(async (file: string) => {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	commands.push(command.data.toJSON());
});

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
	console.log('Please provide a Discord token and client ID');
	process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => console.log('✅ Successfully registered application commands.'))
	.catch(console.error);