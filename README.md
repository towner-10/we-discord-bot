# UWO Engineering Discord Server Bot

Upgraded bot that uses slash commands. Uses `discord.js v14` with the Notion API to interact with a database containing the current first year schedule.

## Commands - User

- `/schedule (class)`
- `/textbooks`
- `/to-mcchicken`
- `/new-announcement (image)`
- `/delete-announcement (id)`
- `/get-announcement (id)`

## Commands - Admin

- `/set-channel (type) (channel)`
- `/set-weekly (week)`

## Installation

Create `.env` file and fill in the following variables:

```env
# Discord
DISCORD_TOKEN=123456789
CLIENT_ID=123456789

# Notion
NOTION_TOKEN=123456789
NOTION_DATABASE_ID=6aacedd4ae4b414b8aca407f7ea3396b

# Settings
LOG_LEVEL=debug
ADMIN_ROLE=Leader
```

Run `npm i` to install all the required packages. Then execute `npm run deploy` to send out the slash commands to the server. To make these commands actually work you have to run `npm start` to spin up the bot.
