import { ActivityType, Client, Events } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";
import { weekData } from "../helpers/weeklySchedule";
import { logger } from "../helpers/logging";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        AnnouncementManager.getInstance().init(client);

        logger.success('Ready!');
        logger.info(`Logged in as: ${client.user?.tag}`);
        client.user?.setActivity(`Week ${weekData.week}`, { type: ActivityType.Watching })
    }
}