const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');

let weekData = require("../currentWeek.json");
let scheduleData = [];

// Variables for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(process.cwd(), './credentials.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

module.exports.getWeek = () => weekData["week"];
module.exports.getScheduleData = () => scheduleData;

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
module.exports.createEmbed = (className = undefined) => {
    const { EmbedBuilder } = require('discord.js');

    if (scheduleData.length > 0) {

        const scheduleEmbed = new EmbedBuilder().setColor(0x9a6dbe);

        // If a class name was provided, only show the schedule for that class.
        if (className) {
            // Generate embed for the schedule
            scheduleEmbed.setTitle(`${className} - Week ${weekData["week"]}`);

            // Create a list of all of the schedule items
            scheduleData.forEach(classElement => {
                if (classElement.class === className) {
                    let scheduleItems = '';
                    classElement.items.forEach(item => {
                        scheduleItems += (item + '\n');
                    });
                    scheduleEmbed.setDescription(scheduleItems);
                }
            });

            return scheduleEmbed;
        }

        // Generate embed for the schedule with all classes
        scheduleEmbed.setTitle(`Week ${weekData["week"]}`);
        const fields = [];

        // Create a list of all of the schedule items for each class
        scheduleData.forEach(classElement => {
            let scheduleItems = "";

            classElement.items.forEach(item => {
                scheduleItems += (item + "\n");
            });

            if (classElement.class !== "") fields.push({ name: classElement.class, value: scheduleItems });
        });

        scheduleEmbed.addFields(fields);

        return scheduleEmbed;
    }

    return new EmbedBuilder().setTitle(`Week ${weekData["week"]}`).setColor(0x9a6dbe).setDescription("No schedule data found!");
}

/**
 * Authorize with Google and fetch the current weeks schedule.
 */
module.exports.authorizeAndFetch = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: SCOPES
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        console.log(`⌛ Fetching schedule data from Google Sheets API`);

        try {
            // Fetch the table from the API given the corresponding Week sheet.
            const getRows = await googleSheets.spreadsheets.values.get({
                auth,
                spreadsheetId: SPREADSHEET_ID,
                range: `Week ${weekData["week"]}`
            });

            // Reset the schedule data.
            scheduleData = [];

            if (getRows.status !== 200) throw new Error(`Error fetching data from Google Sheets API. Status code: ${getRows.status}`);

            // Go through the headers and setup the initial objects in the schedule data array.
            for (let col = 0; col < getRows.data.values[0].length; col++) {
                scheduleData.push({
                    class: getRows.data.values[0][col],
                    items: []
                });
            }

            // Add the corresponding tasks/items to classes
            for (let row = 1; row < getRows.data.values.length; row++) {
                for (let col = 0; col < getRows.data.values[row].length; col++) {
                    scheduleData[col].items.push(getRows.data.values[row][col])
                }
            }

            console.log(`✅ Successfully fetched & updated the current schedule`);
        } catch (err) {
            console.error("❌ Unable to fetch the correct rows! Try changing the current week.");
        }

        return scheduleData;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}