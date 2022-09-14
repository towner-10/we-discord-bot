# UWO Engineering Discord Server Bot

Upgraded bot that uses slash commands. Uses `discord.js v14` with the Google Sheets API to interact with a spreadsheet with the current first year schedule.

## Commands

- **Admin -** /add-beef (user1) (user2)
- **Admin -** /set-weekly (week)
- **Admin -** /set-weekly (week)
- /beef-counter
- /schedule (class)
- /textbooks
- /to-mcchicken

## Installation

Create `.env` file and fill in the following variables:

```
DISCORD_TOKEN=123456789
CLIENT_ID=123456789
GUILD_ID=123456789
ADMIN_ROLE=Leader
SPREADSHEET_ID=1oQDgT7eO0zSD0EBQUZ7h7DzIM-84Slw91XDT7xFmzQc
```

Make sure you also add `credentials.json` which is the key from the Service Worker found on the Google Cloud API page. Next run `npm i` to install all the required packages. Then execute `npm run deploy` to send out the slash commands to the server. To make these commands actually work you have to run `npm start` to spin up the bot.
