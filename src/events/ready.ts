import dayjs from "dayjs";
import { ActivityType, Client, Events } from "discord.js";
import Database from "../helpers/database";
import { weekData } from "../helpers/weeklySchedule";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        Database.getInstance();
        console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
        client.user?.setActivity(`Week ${weekData.week}`, { type: ActivityType.Watching })
    }
}