import dayjs from "dayjs";
import { ActivityType, Client, Events } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";
import { weekData } from "../helpers/weeklySchedule";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        AnnouncementManager.getInstance().init(client);

        console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
        client.user?.setActivity(`Week ${weekData.week}`, { type: ActivityType.Watching })
    }
}