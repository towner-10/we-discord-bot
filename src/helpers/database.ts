import { Announcement, PrismaClient } from '@prisma/client'

export default class Database {

    client: PrismaClient;

    private static instance: Database;

    private constructor() {
        this.client = new PrismaClient();
    }

    public async createAnnouncement(title: string, description: string, content: string, user: string, image?: string): Promise<Announcement | null> {
        try {
            if (image) {
                const announcement = await this.client.announcement.create({
                    data: {
                        title: title,
                        description: description,
                        content: content,
                        image: image,
                        user: user
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
                    user: user
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