import dayjs from "dayjs";
import { Events } from "discord.js";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute() {
        console.log(`✅ Ready! - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
    }
}