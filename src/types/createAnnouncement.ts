import { Attachment, Guild, User } from "discord.js";

export interface CreateAnnouncement {
    title: string;
    description: string;
    content: string;
    user: string;
    guild: string;
    message: string;
    image?: string;
}

export interface CreateAnnouncementDiscord {
    title: string;
    description: string;
    content: string;
    user: User;
    guild: Guild;
    image?: Attachment;
}