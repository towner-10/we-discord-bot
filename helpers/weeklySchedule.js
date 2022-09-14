const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');

let weekData = require("../currentWeek.json");
let scheduleData = [];

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(process.cwd(), './credentials.json');
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

module.exports.getWeek = () => {
    return weekData["week"];
}

module.exports.setWeek = async (week) => {
    try {
        const json = { "week": week }

        await fs.writeFile('./currentWeek.json', JSON.stringify(json), 'utf8');
        console.log(`Updated the week to ${week}`);

        weekData = json;

        return true;
    } catch (err) {
        return false;
    }
}

module.exports.getScheduleData = () => scheduleData;

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

        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: SPREADSHEET_ID,
            range: `Week ${weekData["week"]}!A1:AA1000`
        });

        scheduleData = [];

        for (let col = 0; col < getRows.data.values[0].length; col++) {
            scheduleData.push({
                class: getRows.data.values[0][col],
                items: []
            });
        }

        for (let row = 1; row < getRows.data.values.length; row++) {
            for (let col = 0; col < getRows.data.values[row].length; col++) {
                scheduleData[col].items.push(getRows.data.values[row][col])
            }
        }

        return scheduleData;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}