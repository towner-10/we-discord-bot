import { ClassMap } from "src/types/classMap";
import { EmbedField } from "src/types/embedField";

import { EmbedBuilder } from "discord.js";

import fs from 'fs';
import { Client } from "@notionhq/client";
import dayjs from 'dayjs';

import currentWeek from "../currentWeek.json";

let weekData = currentWeek;

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

async function fetchSchedule(className?: string) {
    if (!process.env.NOTION_DATABASE_ID) return;

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

    // If a class name was provided, only show the schedule for that class.
    if (className) {
        // Generate embed for the schedule
        scheduleEmbed.setTitle(`${className} - Week ${weekData["week"]}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');

        const scheduleData = await fetchSchedule(className);

        if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week.");

        const fields: EmbedField[] = [];

        scheduleData.forEach((item: any) => {
            let date = "";

            if (item.properties['Due Date'].date.start !== null) {
                date = dayjs(item.properties['Due Date'].date.start).format('MM/DD/YYYY hh:mm A');
            }

            if (item.properties['Due Date'].date.end !== null) {
                date += ` to ${dayjs(item.properties['Due Date'].date.end).format('hh:mm A')}`;
            }

            let value = "";

            if (date !== "") {
                value += `⤍ *Due Date:* ${date}\n`;
            } else {
                value += `⤍ *Due Date:* N/A\n`;
            }

            if (item.properties['Notes'].rich_text !== null) {
                if (item.properties['Notes'].rich_text.length > 0) {
                    let notes = "";

                    item.properties['Notes'].rich_text.forEach((note: any) => {
                        notes += `${note.plain_text}\n`;
                    });

                    value += `\`\`\`${notes}\`\`\``;
                }
            }

            fields.push({
                name: item.properties['Name'].title[0].plain_text,
                value: value,
            });
        });

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
    scheduleData.forEach((item: any) => {
        let date = "";

        if (item.properties['Due Date'].date !== null) {
            date = dayjs(item.properties['Due Date'].date.start).format('MM/DD/YYYY hh:mm A');

            if (item.properties['Due Date'].date.end !== null) {
                date += ` to ${dayjs(item.properties['Due Date'].date.end).format('hh:mm A')}`;
            }
        }

        let value = "";

        if (date !== "") {
            value += `⤍ *Due Date:* ${date}\n`;
        } else {
            value += `⤍ *Due Date:* N/A\n`;
        }

        if (item.properties['Notes'].rich_text !== null) {
            if (item.properties['Notes'].rich_text.length > 0) {
                let notes = "";

                item.properties['Notes'].rich_text.forEach((note: any) => {
                    notes += `${note.plain_text}\n`;
                });

                value += `\`\`\`${notes}\`\`\``;
            }
        }

        item.properties['Tags'].multi_select.forEach((tag: any) => {
            if (tag.name in classes) {
                classes[tag.name].push(`__${item.properties['Name'].title[0].plain_text}__\n${value}`);
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

    console.log(`✅ Created schedule for ${weekData["week"]} at ${dayjs().format('MM/DD/YYYY hh:mm A')}`);

    return scheduleEmbed;
}