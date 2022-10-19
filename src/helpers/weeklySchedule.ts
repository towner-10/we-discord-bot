import { ClassMap } from "src/types/classMap";
import { EmbedField } from "src/types/embedField";

import { EmbedBuilder } from "discord.js";

import fs from 'fs';
import { Client, isFullPage } from "@notionhq/client";
import { DatePropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import dayjs from 'dayjs';

import currentWeek from "../currentWeek.json";

let weekData = currentWeek;

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

async function fetchSchedule(className?: string) {
    if (!process.env.NOTION_DATABASE_ID) throw new Error("No database ID provided");

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
                            contains: `Week ${weekData["week"]}`,
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
                contains: `Week ${weekData["week"]}`,
            }
        }
    });

    return scheduleData.results;
}


/**
 * Set the current week and write it to the storage file.
 */
export async function setWeek(week: number) {
    const json = { "week": week };

    try {
        await fs.promises.writeFile('./src/currentWeek.json', JSON.stringify(json));
    } catch (err) {
        console.error(`❌ Error writing file: ${err}`);
        return false;
    }

    console.log(`✅ Updated the week to ${week}`);
    weekData = json;
    return true;
}



/**
 * Creates an embed with the current weeks schedule.
 * @param {*} className The name of the class to get the schedule for.
 * @returns Either an Embed containing the weekly schedule, weekly schedule for a specific class, or an error message.
 */
export async function createEmbed(className?: string) {
    const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe).setFooter({
        text: `Created by WE Discord Bot`
    }).setTimestamp();

    // TODO: Create function to combine repeat code

    // If a class name was provided, only show the schedule for that class.
    if (className) {

        // Generate embed for the schedule
        scheduleEmbed.setTitle(`${className} - Week ${weekData["week"]}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');

        // Get the schedule for the class
        const scheduleData = await fetchSchedule(className);

        // If there is no schedule for the class, return an error message.
        if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week. Check the week number and try again.");

        const fields: EmbedField[] = [];

        // Loop through the schedule data and add it to the embed.
        for (const page of scheduleData) {
            if (!isFullPage(page)) {
                console.error(`❌ Error: Page data is not full`);
                continue;
            }

            let dateText = "";

            // Get corresponding values from the page
            const name = (page.properties['Name'] as { type: "title"; title: Array<RichTextItemResponse>; id: string }).title[0].plain_text;
            const date = (page.properties['Due Date'] as DatePropertyItemObjectResponse).date;
            const notes = (page.properties['Notes'] as { type: "rich_text"; rich_text: Array<RichTextItemResponse>; id: string }).rich_text;

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
                    let noteText = "";

                    notes.forEach((note: RichTextItemResponse) => {
                        noteText += `${note.plain_text}\n`;
                    });

                    text += `\`\`\`${noteText}\`\`\``;
                }
            }

            fields.push({
                name: name,
                value: text,
            });
        }

        scheduleEmbed.addFields(fields);

        console.log(`✅ Created schedule for ${className} at ${dayjs().format('MM/DD/YYYY hh:mm A')}`);

        return scheduleEmbed;
    }

    const scheduleData = await fetchSchedule();
    if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week.");

    // Generate embed for the schedule with all classes
    scheduleEmbed.setTitle(`Week ${weekData["week"]}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');
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
    for (const page of scheduleData) {
        if (!isFullPage(page)) {
            console.error(`❌ Error: Page data is not full`);
            continue;
        }

        let text = "";

        const name = (page.properties['Name'] as { type: "title"; title: Array<RichTextItemResponse>; id: string }).title[0].plain_text;
        const date = (page.properties['Due Date'] as DatePropertyItemObjectResponse).date;
        const notes = (page.properties['Notes'] as { type: "rich_text"; rich_text: Array<RichTextItemResponse>; id: string }).rich_text;
        const tags = (page.properties['Tags'] as MultiSelectPropertyItemObjectResponse).multi_select;

        let dateText = "";

        if (date?.start !== null) {
            dateText = dayjs(date?.start).format('DD/MM/YYYY h:mm A');
        }

        if (date?.end !== null) {
            dateText += ` to ${dayjs(date?.end).format('h:mm A')}`;
        }

        if (dateText !== "") {
            text += `⤍ *Due Date:* ${dateText}\n`;
        } else {
            text += `⤍ *Due Date:* N/A\n`;
        }

        if (notes !== null) {
            if (notes.length > 0) {
                let noteText = "";

                notes.forEach((note: RichTextItemResponse) => {
                    noteText += `${note.plain_text}\n`;
                });

                text += `\`\`\`${noteText}\`\`\``;
            }
        }

        tags.forEach((tag) => {
            if (tag.name in classes) {
                classes[tag.name].push(`__${name}__\n${text}`);
            }
        });
    }

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

    console.log(`✅ Created schedule for ${weekData["week"]} at ${dayjs().format('MM/DD/YYYY hh:mm A')}`);

    return scheduleEmbed;
}