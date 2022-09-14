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

        try {

            console.log(`⌛ Fetching schedule data from Google Sheets API`);

            // Fetch the table from the API given the corresponding Week sheet.
            const getRows = await googleSheets.spreadsheets.values.get({
                auth,
                spreadsheetId: SPREADSHEET_ID,
                range: `Week ${weekData["week"]}!A1:AA1000`
            });

            // Reset the schedule data.
            scheduleData = [];

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
            console.log("❌ Unable to fetch the correct rows! Try changing the current week.");
        }

        return scheduleData;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}