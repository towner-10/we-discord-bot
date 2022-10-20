import { Announcement, Channels, PrismaClient } from '@prisma/client'

export default class Database {

    client: PrismaClient;

    private static instance: Database;

    private constructor() {
        this.client = new PrismaClient();
    }

    public async setAnnouncementChannel(announcementChannel: string, guild: string): Promise<void> {
        try {
            await this.client.channels.upsert({
                where: {
                    guildId: guild,
                },
                update: {
                    announcementChannel: announcementChannel
                },
                create: {
                    guildId: guild,
                    announcementChannel: announcementChannel,
                    announcementTicketChannel: "",
                }
            });

            console.log(`✅ Announcement channel set to ${announcementChannel} for guild ${guild}`);

            return;
        }
        catch (error) {
            console.error(error);
        }
    }

    public async setAnnouncementTicketChannel(announcementTicketChannel: string, guild: string): Promise<void> {
        try {
            await this.client.channels.upsert({
                where: {
                    guildId: guild,
                },
                update: {
                    announcementTicketChannel: announcementTicketChannel
                },
                create: {
                    guildId: guild,
                    announcementChannel: "",
                    announcementTicketChannel: announcementTicketChannel,
                }
            });

            console.log(`✅ Announcement ticket channel set to ${announcementTicketChannel} for guild ${guild}`);

            return;
        }
        catch (error) {
            console.error(error);
        }
    }

    public async getAnnouncementChannel(guild: string): Promise<Channels | null> {
        try {
            const channel = await this.client.channels.findUnique({
                where: {
                    guildId: guild
                }
            });

            if (!channel) return null;
            if (channel.announcementChannel === "") return null;

            return channel;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async getAnnouncementTicketChannel(guild: string): Promise<Channels | null> {
        try {
            const channel = await this.client.channels.findUnique({
                where: {
                    guildId: guild
                }
            });

            if (!channel) return null;
            if (channel.announcementTicketChannel === "") return null;

            return channel;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async createAnnouncement(title: string, description: string, content: string, user: string, guild: string, message: string, image?: string): Promise<Announcement | null> {
        console.log(`📝 Creating announcement with title: ${title}`);
        try {
            if (image) {
                const announcement = await this.client.announcement.create({
                    data: {
                        title: title,
                        description: description,
                        content: content,
                        image: image,
                        user: user,
                        guild: guild,
                        message: message
                    }
                });

                console.log(`✅ Announcement created with id: ${announcement.id}`);

                return announcement;
            }
            const announcement = await this.client.announcement.create({
                data: {
                    title: title,
                    description: description,
                    content: content,
                    image: "",
                    user: user,
                    message: message,
                    guild: guild
                }
            });

            console.log(`✅ Announcement created with id: ${announcement.id}`);

            return announcement;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async getAnnouncement(id: number): Promise<Announcement | null> {
        try {
            const announcement = await this.client.announcement.findUnique({
                where: {
                    id: id
                }
            });

            console.log(`✅ Announcement found with id: ${announcement?.id}`);

            return announcement;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async getAnnouncementsByUser(user: string): Promise<Announcement[]> {
        try {
            const announcements = await this.client.announcement.findMany({
                where: {
                    user: user
                }
            });

            console.log(`✅ Announcements found: ${announcements.length}`);

            return announcements;
        }
        catch (error) {
            console.error(error);
        }

        return [];
    }

    public async getAnnouncements(): Promise<Announcement[] | null> {
        try {
            const announcements = await this.client.announcement.findMany();

            console.log(`✅ Announcements found: ${announcements.length}`);

            return announcements;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async deleteAnnouncement(id: number): Promise<Announcement | null> {
        try {
            const announcement = await this.client.announcement.delete({
                where: {
                    id: id
                }
            });

            console.log(`✅ Announcement deleted with id: ${announcement.id}`);

            return announcement;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}