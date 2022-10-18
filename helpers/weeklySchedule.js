const fs = require('fs').promises;
const process = require('process');
const { Client } = require("@notionhq/client");
const dayjs = require('dayjs');

let weekData = require("../currentWeek.json");

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

module.exports.getWeek = () => weekData["week"];

async function fetchSchedule(className = undefined) {
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
module.exports.setWeek = async (week) => {
    try {
        const json = { "week": week }

        await fs.writeFile('./currentWeek.json', JSON.stringify(json), 'utf8');
        console.log(`✅ Updated the week to ${week}`);

        weekData = json;

        return true;
    } catch (err) {
        return false;
    }
}



/**
 * Creates an embed with the current weeks schedule.
 * @param {*} className The name of the class to get the schedule for.
 * @returns Either an Embed containing the weekly schedule, weekly schedule for a specific class, or an error message.
 */
module.exports.createEmbed = async (className = undefined) => {
    const { EmbedBuilder } = require('discord.js');

    const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe).setFooter({
        text: `Created by WE Discord Bot`
    }).setTimestamp();

    // If a class name was provided, only show the schedule for that class.
    if (className) {
        // Generate embed for the schedule
        scheduleEmbed.setTitle(`${className} - Week ${weekData["week"]}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');

        const scheduleData = await fetchSchedule(className);

        if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week.");

        const fields = [];

        scheduleData.forEach(item => {
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

                    item.properties['Notes'].rich_text.forEach(note => {
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

        console.log(`✅ Created schedule for ${weekData["week"]} for ${className} at ${dayjs().format('MM/DD/YYYY hh:mm A')}`);

        return scheduleEmbed;
    }

    const scheduleData = await fetchSchedule();
    if (scheduleData === undefined || scheduleData.length === 0) return scheduleEmbed.setDescription("No schedule data found for this week.");

    // Generate embed for the schedule with all classes
    scheduleEmbed.setTitle(`Week ${weekData["week"]}`).setURL('https://spotless-value-235.notion.site/6aacedd4ae4b414b8aca407f7ea3396b?v=56fd0036dc974da2b6699d06fc6999c0');
    const fields = [];

    const classes = {
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
    scheduleData.forEach(item => {
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

                item.properties['Notes'].rich_text.forEach(note => {
                    notes += `${note.plain_text}\n`;
                });

                value += `\`\`\`${notes}\`\`\``;
            }
        }

        item.properties['Tags'].multi_select.forEach(tag => {
            if (tag.name in classes) {
                classes[tag.name].push(`__${item.properties['Name'].title[0].plain_text}__\n${value}`);
            }
        });
    });

    for ([key, value] of Object.entries(classes)) {
        if (value.length > 0) {
            value.push('\n');
            fields.push({
                name: `***${key}***`,
                value: value.join(''),
            });
        }
    }

    scheduleEmbed.addFields(fields);

    console.log(`✅ Created schedule for ${weekData["week"]} at ${dayjs().format('MM/DD/YYYY hh:mm A')}`);

    return scheduleEmbed;
}