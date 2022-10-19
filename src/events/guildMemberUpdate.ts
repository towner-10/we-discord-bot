import { Events, GuildMember } from "discord.js";

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        if (oldMember.premiumSince !== newMember.premiumSince) {
            //your code here
        }
    }
};