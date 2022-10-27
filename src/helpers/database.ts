import { Announcement, Guild, PrismaClient } from '@prisma/client'

export default class Database {

    client: PrismaClient;

    private static instance: Database;

    private constructor() {
        this.client = new PrismaClient();
    }

    public async setAnnouncementChannel(announcementChannel: string, guildId: string): Promise<void> {
        try {
            await this.client.guild.upsert({
                where: {
                    guildId: guildId,
                },
                update: {
                    announcementChannel: announcementChannel
                },
                create: {
                    guildId: guildId,
                    announcementChannel: announcementChannel,
                    announcementTicketChannel: "",
                }
            });

            console.log(`✅ Announcement channel set to ${announcementChannel} for guild ${guildId}`);

            return;
        }
        catch (error) {
            console.error(error);
        }
    }

    public async setAnnouncementTicketChannel(announcementTicketChannel: string, guildId: string): Promise<void> {
        try {
            await this.client.guild.upsert({
                where: {
                    guildId: guildId,
                },
                update: {
                    announcementTicketChannel: announcementTicketChannel
                },
                create: {
                    guildId: guildId,
                    announcementChannel: "",
                    announcementTicketChannel: announcementTicketChannel,
                }
            });

            console.log(`✅ Announcement ticket channel set to ${announcementTicketChannel} for guild ${guildId}`);

            return;
        }
        catch (error) {
            console.error(error);
        }
    }

    public async getAnnouncementChannel(guildId: string): Promise<string | null> {
        try {
            const guild = await this.client.guild.findUnique({
                where: {
                    guildId: guildId
                }
            });

            if (!guild) return null;

            return guild.announcementChannel;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async getAnnouncementTicketChannel(guildId: string): Promise<string | null> {
        try {
            const guild = await this.client.guild.findUnique({
                where: {
                    guildId: guildId
                }
            });

            if (!guild) return null;

            return guild.announcementTicketChannel;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    public async getGuild(guildId: string): Promise<Guild | null> {
        try {
            const guild = await this.client.guild.findUnique({
                where: {
                    guildId: guildId
                }
            });

            return guild;
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
                        guildId: guild,
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
                    guildId: guild,
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