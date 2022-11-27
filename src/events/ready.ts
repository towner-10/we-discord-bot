import { Client, Events } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";
import { logger } from "../helpers/logging";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        AnnouncementManager.getInstance().init(client);

        logger.success('Ready!');
        logger.info(`Logged in as: ${client.user?.tag}`);
    }
}