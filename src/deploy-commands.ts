import dotenv from 'dotenv';
dotenv.config();

import fs from 'node:fs';
import path from 'node:path';
import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import { logger } from './helpers/logging';
import type { Command } from './types/command';

const getCommands = async () => {
	const result: unknown[] = [];
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

	await Promise.all(commandFiles.map(async (file: string) => {
		const filePath = path.join(commandsPath, file);
		const command: Command = await import(filePath);
		result.push(command.data.toJSON());
	}));

	return result;
}

(async () => {

	const commands = await getCommands();

	try {
		if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
			logger.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file');
			throw new Error('Missing Discord token or client ID');
		}

		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
		logger.success('Registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();