import dotenv from 'dotenv';
dotenv.config();

import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { Command } from './types/command';
import type { Event } from './types/event';
import { logger } from './helpers/logging';

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

export const commands = new Collection<string, Command>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

const events = new Collection<string, Event>();
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts'));

commandFiles.forEach((file: string) => {
    const filePath = path.join(commandsPath, file);
    import(filePath).then((command: Command) => {
        commands.set(command.data.name, command);
    });
});

eventFiles.forEach((file: string) => {
    const filePath = path.join(eventsPath, file);
    import(filePath).then((event: Event) => {
        events.set(event.name, event);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });
});

const exitProcess = () => {
    logger.waiting('Exiting...');
    client.destroy();
    logger.success('Bot stopped.');
}

process.on('SIGINT', () => exitProcess());

client.login(process.env.DISCORD_TOKEN);