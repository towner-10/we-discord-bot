import { ClassMap } from "src/types/classMap";
import { EmbedField } from "src/types/embedField";

import { EmbedBuilder } from "discord.js";

import { Client, isFullPage } from "@notionhq/client";
import { DatePropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, PageObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import dayjs from 'dayjs';

import { NameNotion, NotesNotion } from "src/types/notion";
import { logger } from "./logging";
import Database from "./database";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const database = Database.getInstance();

async function fetchSchedule(guildId: string, className?: string) {
    if (!process.env.NOTION_DATABASE_ID) throw new Error("No database ID provided");

    const week = await database.guilds.currentWeek.get(guildId);

    if (!week) throw new Error("No week found");

    // TODO: Add error handling for Notion API
    if (className) {
        const scheduleData = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                and: [
                    {
                        property: 'Tags',
                        multi_select: {
                            contains: className,
                        }
                    },
                    {
                        property: 'Tags',
                        multi_select: {
                            contains: `Week ${week}`,
                        }
                    },
                ],
            }
        });

        return scheduleData.results;
    }

    const scheduleData = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
            property: 'Tags',
            multi_select: {
                contains: `Week ${week}`,
            }
        }
    });

    return scheduleData.results;
}

/**
 * Creates an embed with the current weeks schedule.
 * @param {*} className The name of the class to get the schedule for.
 * @returns Either an Embed containing the weekly schedule, weekly schedule for a specific class, or an error message.
 */
export async function createEmbed(guildId: string, className?: string) {
    const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe).setFooter({
        text: `Created by WE Discord Bot`
    }).setTimestamp();

    // Get the schedule data from Notion
    const processPage = (page: PageObjectResponse) => {
        let dateText = "";

        // Get corresponding values from the page
        const name = (page.properties['Name'] as NameNotion).title[0].plain_text;
        const date = (page.properties['Due Date'] as DatePropertyItemObjectResponse).date;
        const notes = (page.properties['Notes'] as NotesNotion).rich_text;

        if (date?.start !== null) {
            dateText = dayjs(date?.start).format('DD/MM/YYYY h:mm A');
        }

        if (date?.end !== null) {
            dateText += ` to ${dayjs(date?.end).format('h:mm A')}`;
        }

        let text = "";

        if (dateText !== "") {
            text += `⤍ *Due Date:* ${dateText}\n`;
        } else {
            text += `⤍ *Due Date:* N/A\n`;
        }

        if (notes !== null) {
            if (notes.length > 0) {
                let noteText = "> ";

                notes.forEach((note: RichTextItemResponse) => {
                    let noteTextPart = note.plain_text;

                    if (note.annotations.bold) noteTextPart = '**' + noteTextPart + '**';
                    if (note.annotations.italic) noteTextPart = '*' + noteTextPart + '*';
                    if (note.annotations.strikethrough) noteTextPart = '~~' + noteTextPart + '~~';
                    if (note.annotations.underline) noteTextPart = '__' + noteTextPart + '__';
                    if (note.annotations.code) noteTextPart = '`' + noteTextPart + '`';

                    noteTextPart = noteTextPart.replace('\n', '\n> ');

                    noteText += noteTextPart;
                });

                text += noteText;
            }

            text += '\n';
        }

        return {
            name: name,
            text: text
        };
    };

    const week = await database.guilds.currentWeek.get(guildId);

    if (!week) throw new Error("No week found");

    // If a class name was provided, only show the schedule for that class.
    if (className) {

        // Generate embed for the schedule
        scheduleEmbed.setTitle(`${className} - Week ${week}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');

        // Get the schedule for the class
        const scheduleData = await fetchSchedule(className);

        // If there is no schedule for the class, return an error message.
        if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week. Check the week number and try again.");

        const fields: EmbedField[] = [];

        // Loop through the schedule data and add it to the embed.
        scheduleData.forEach((value) => {
            if (!isFullPage(value)) {
                console.error(`❌ Error: Page data is not full`);
                return;
            }

            const { name, text } = processPage(value);

            fields.push({
                name: name,
                value: text
            });
        });

        scheduleEmbed.addFields(fields);

        logger.success(`Schedule for ${className} created`);

        return scheduleEmbed;
    }

    const scheduleData = await fetchSchedule(guildId);
    if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week.");

    // Generate embed for the schedule with all classes
    scheduleEmbed.setTitle(`Week ${week}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');
    const fields: EmbedField[] = [];

    const classes: ClassMap = {
        'Calculus': [],
        'Chemistry': [],
        'Design': [],
        'Linear Algebra': [],
        'Physics': [],
        'Programming': [],
        'Statics': [],
        'Materials': [],
        'Business': []
    };

    // Create a list of all of the schedule items for each class
    scheduleData.forEach((value) => {
        if (!isFullPage(value)) {
            console.error(`❌ Error: Page data is not full`);
            return;
        }

        const tags = (value.properties['Tags'] as MultiSelectPropertyItemObjectResponse).multi_select;

        const { name, text } = processPage(value);

        tags.forEach((tag) => {
            if (tag.name in classes) {
                classes[tag.name].push(`__${name}__\n${text}`);
            }
        });
    });

    for (const className in classes) {
        if (classes[className].length > 0) {
            classes[className].push('\n');
            fields.push({
                name: `***${className}***`,
                value: classes[className].join(''),
            });
        }
    }

    scheduleEmbed.addFields(fields);

    logger.success(`Schedule created for all classes`);

    return scheduleEmbed;
}