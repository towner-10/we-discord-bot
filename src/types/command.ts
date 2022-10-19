import { ChatInputApplicationCommandData, Interaction, SlashCommandBuilder } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => Promise<void>;
}