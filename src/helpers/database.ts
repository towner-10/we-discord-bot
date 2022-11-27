import { Announcement, Guild, PrismaClient } from '@prisma/client'
import { logger } from './logging';

export default class Database {

    client: PrismaClient;

    private static instance: Database;

    private constructor() {
        this.client = new PrismaClient();
    }

    announcements = {
        /**
         * Get an announcement by its ID
         * @param id The ID of the announcement
         * @returns The announcement
         */
        get: async (id: number): Promise<Announcement | null> => {
            try {
                const announcement = await this.client.announcement.findUnique({
                    where: {
                        id: id
                    }
                });

                if (!announcement) {
                    logger.warn(`Announcement with id ${id} not found`);
                    return null;
                }

                logger.info(`Announcement found with id: ${announcement?.id}`);

                return announcement;
            }
            catch (error) {
                console.error(error);
            }

            return null;
        },
        /**
         * Get all announcements in the database
         * @returns All announcements
         */
        getAll: async (): Promise<Announcement[]> => {
            try {
                const announcements = await this.client.announcement.findMany();

                if (!announcements) {
                    logger.warn(`No announcements found`);
                    return [];
                }

                logger.info(`Announcements found: ${announcements.length}`);

                return announcements;
            }
            catch (error) {
                console.error(error);
            }

            return [];
        },
        /**
         * Create an announcement
         * @param title The title of the announcement
         * @param description The description of the announcement
         * @param content The content of the announcement
         * @param user The user who created the announcement
         * @param guild The guild the announcement was created in
         * @param message The message ID of the announcement
         * @param image The image of the announcement
         * @returns The created announcement
         */
        create: async (title: string, description: string, content: string, user: string, guild: string, message: string, image?: string): Promise<Announcement | null> => {
            logger.waiting(`Creating announcement...`);
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

                    logger.success(`Announcement created with id: ${announcement.id}`);

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

                logger.success(`Announcement created with id: ${announcement.id}`);

                return announcement;
            }
            catch (error) {
                console.error(error);
            }

            return null;
        },
        /**
         * Delete an announcement
         * @param id The ID of the announcement
         * @returns The deleted announcement
         */
        delete: async (id: number): Promise<Announcement | null> => {
            try {
                const announcement = await this.client.announcement.delete({
                    where: {
                        id: id
                    }
                });

                if (!announcement) {
                    logger.warn(`Announcement with id ${id} not found`);
                    return null;
                }

                logger.success(`Announcement deleted with id: ${announcement.id}`);

                return announcement;
            }
            catch (error) {
                console.error(error);
            }

            return null;
        },
        /**
         * Get all announcements created by a user
         * @param user The user to get announcements for
         * @returns The announcements for the user
         */
        getByUser: async (user: string): Promise<Announcement[] | null> => {
            try {
                const announcements = await this.client.announcement.findMany({
                    where: {
                        user: user
                    }
                });

                if (announcements.length === 0) {
                    logger.warn(`No announcements found for user ${user}`);
                    return [];
                }

                logger.info(`Announcements found for user ${user}: ${announcements.length}`);

                return announcements;
            }
            catch (error) {
                console.error(error);
            }

            return [];
        }
    };

    guilds = {
        /**
         * Get a guild by its ID
         * @param guildId The ID of the guild
         * @returns The guild (null if not found)
         */
        get: async (guildId: string): Promise<Guild | null> => {
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
        },
        currentWeek: {
            /**
             * Get the current week for a guild
             * @param guildId The ID of the guild
             * @returns The current week in the schedule for the guild (null if not found)
             */
            get: async (guildId: string): Promise<number | null> => {
                try {
                    const guild = await this.client.guild.findUnique({
                        where: {
                            guildId: guildId
                        }
                    });

                    if (!guild) {
                        logger.warn(`Guild with id ${guildId} not found`);
                        return null;
                    }

                    return guild.currentWeek;
                }
                catch (error) {
                    console.error(error);
                }

                return null;
            },
            /**
             * Set the current week for a guild
             * @param guildId The ID of the guild
             * @param week The week to set the current week to
             * @returns The updated guild (null if not found)
             */
            set: async (guildId: string, week: number): Promise<Guild | null> => {
                try {
                    const guild = await this.client.guild.update({
                        where: {
                            guildId: guildId
                        },
                        data: {
                            currentWeek: week
                        }
                    });

                    if (!guild) {
                        logger.warn(`Guild with id ${guildId} not found`);
                        return null;
                    }

                    logger.success(`Current week for guild ${guildId} set to: ${week}`);

                    return guild;
                }
                catch (error) {
                    console.error(error);
                }

                return null;
            }
        },
        channels: {
            announcements: {
                /**
                 * Get the announcement channel for a guild
                 * @param guildId The ID of the guild
                 * @returns The announcement channel ID (null if not found)
                 */
                get: async (guildId: string): Promise<string | null> => {
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
                },
                /**
                 * Set the announcement channel for a guild
                 * @param announcementChannel The announcement channel ID
                 * @param guildId The ID of the guild
                 */
                set: async (announcementChannel: string, guildId: string): Promise<void> => {
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

                        logger.info(`Announcement channel set to ${announcementChannel} for guild ${guildId}`);

                        return;
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            },
            announcementTickets: {
                /**
                 * Get the announcement ticket channel for a guild
                 * @param guildId The ID of the guild
                 * @returns The announcement ticket channel ID (null if not found)
                 */
                get: async (guildId: string): Promise<string | null> => {
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
                },
                /**
                 * Set the announcement ticket channel for a guild
                 * @param announcementTicketChannel The announcement ticket channel ID
                 * @param guildId The ID of the guild
                 */
                set: async (announcementTicketChannel: string, guildId: string): Promise<void> => {
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

                        logger.info(`Announcement ticket channel set to ${announcementTicketChannel} for guild ${guildId}`);

                        return;
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    };

    /**
     * Get the instance of the database client. Uses the singleton pattern.
     * @returns The database instance
     */
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}