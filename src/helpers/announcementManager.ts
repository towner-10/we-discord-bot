import { Announcement } from "@prisma/client";
import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelType, Client, ComponentType, EmbedBuilder, Guild, InteractionCollector, Message, OverwriteResolvable, OverwriteType, PermissionFlagsBits, TextChannel, User } from "discord.js";
import Database from "./database";
import { logger } from "./logging";

export default class AnnouncementManager {

    private static instance: AnnouncementManager;

    private collectors: Map<string, InteractionCollector<ButtonInteraction<CacheType>>>;
    private database: Database;

    private constructor() {
        this.database = Database.getInstance();
        this.collectors = new Map<string, InteractionCollector<ButtonInteraction<CacheType>>>();
    }

    public async init(client: Client): Promise<void> {
        const announcements = await this.database.announcements.getAll();

        if (!announcements) return;

        // Read all announcements from the database in sequence to prevent multiple channels being created at once
        for (const announcement of announcements) {
            const guild = await client.guilds.fetch(announcement.guildId);

            // If the collector for the guild already exists, return
            if (this.collectors.has(announcement.guildId)) return;

            // Get the announcement ticket channel
            const ticketsChannel = await this.getAnnouncementTicketsChannel(guild);

            // Create the collector for the channel
            const collector = ticketsChannel.createMessageComponentCollector({ componentType: ComponentType.Button });
            this.collectors.set(announcement.guildId, collector);

            // Set up the collector
            await this.setupCollector(this.collectors.get(announcement.guildId), guild);
        }
    }

    /**
     * Fetches the announcement ticket channel for the guild.
     * @param guild The guild to get the announcement ticket channel for
     * @returns The announcement ticket channel
     */
    private async getAnnouncementTicketsChannel(guild: Guild): Promise<TextChannel> {
        // Get the announcement channel from the database
        const announcementTicketChannel = await this.database.guilds.channels.announcementTickets.get(guild.id);

        let channel: TextChannel | null = null;

        if (announcementTicketChannel) {
            try {
                channel = await guild.channels.fetch(announcementTicketChannel) as TextChannel;
            } catch (error) {
                channel = null;
            }
        }

        // If channel not in database
        if (!channel) {
            const adminRole = guild.client.guilds.cache.get(guild.id)?.roles.cache.find(role => role.name === process.env.ADMIN_ROLE);
            const everyoneRole = guild.client.guilds.cache.get(guild.id)?.roles.everyone;

            let permissions: OverwriteResolvable[] = [];

            if (!everyoneRole) throw new Error('Everyone role not found.');

            // If admin role exists, set permissions for it, otherwise just set permissions for everyone
            if (!adminRole) permissions = [{ type: OverwriteType.Role, id: everyoneRole, deny: [PermissionFlagsBits.ViewChannel] }];
            else {
                permissions = [
                    { type: OverwriteType.Role, id: everyoneRole, deny: [PermissionFlagsBits.ViewChannel] },
                    { type: OverwriteType.Role, id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel] }
                ];
            }

            channel = await guild.channels.create({
                name: 'announcement-tickets',
                type: ChannelType.GuildText,
                topic: 'Announcement tickets are created here.',
                reason: 'Announcement tickets channel does not exist.',
                permissionOverwrites: permissions
            });

            await this.database.guilds.channels.announcementTickets.set(channel.id, guild.id);
        }
        // If channel is not in database but in cache 
        else if (!announcementTicketChannel && channel) {
            await this.database.guilds.channels.announcementTickets.set(channel.id, guild.id);
        }

        if (!channel) throw new Error('Channel not found.');

        return channel;
    }

    /**
     * Fetches the announcement channel for the guild.
     * @param guild The guild to get the announcement channel for
     * @returns The announcement channel
     */
    private async getAnnouncementChannel(guild: Guild): Promise<TextChannel> {
        // Get the announcement channel from the database
        const announcementChannel = await this.database.guilds.channels.announcements.get(guild.id);

        let channel: TextChannel | null = null;

        if (announcementChannel) {
            try {
                channel = await guild.channels.fetch(announcementChannel) as TextChannel;
            } catch (error) {
                channel = null;
            }
        }

        // If channel not in database
        if (!channel) {
            channel = await guild.channels.create({
                name: 'announcements',
                type: ChannelType.GuildText
            });

            await this.database.guilds.channels.announcements.set(channel.id, guild.id);
        }
        // If channel is not in database but in cache 
        else if (!announcementChannel && channel) {
            await this.database.guilds.channels.announcements.set(channel.id, guild.id);
        }

        if (!channel) throw new Error('Channel not found.');

        return channel;
    }

    public async setAnnouncementChannel(guild: Guild, channel: TextChannel): Promise<void> {
        await this.database.guilds.channels.announcements.set(channel.id, guild.id);
    }

    public async setAnnouncementTicketsChannel(guild: Guild, channel: TextChannel): Promise<void> {
        await this.database.guilds.channels.announcementTickets.set(channel.id, guild.id);
    }

    private async setupCollector(collector: InteractionCollector<ButtonInteraction<CacheType>> | undefined, guild: Guild): Promise<void> {
        if (!collector) return;

        // Set up the collector
        collector.on('collect', async (interaction) => {
            if (interaction.customId.startsWith('send-announcement-everyone-')) {
                const id = interaction.customId.split('-')[3];

                const announcement = await this.database.announcements.get(parseInt(id));

                if (!announcement) {
                    await interaction.update({ content: 'An error occurred while posting the announcement.' });
                    return;
                }

                try {
                    // Get the announcement channel
                    const announcementChannel = await this.getAnnouncementChannel(guild);

                    // Send the announcement
                    await announcementChannel.send({
                        content: `@everyone\n\n__**${announcement.title}**__\n${announcement.description}\n\n>>> ${announcement.content}\n\n- ${(await guild.client.users.fetch(announcement.user)).toString()}`,
                        files: announcement.image ? [announcement.image] : []
                    });

                    await interaction.update({ content: `This announcement has been posted.`, components: [] });
                } catch (error) {
                    logger.error(String(error));
                    await interaction.update({ content: 'An error occurred while posting the announcement.' });
                }
            } else if (interaction.customId.startsWith('send-announcement-')) {
                const id = interaction.customId.split('-')[2];

                const announcement = await this.database.announcements.get(parseInt(id));

                if (!announcement) {
                    await interaction.update({ content: 'An error occurred while posting the announcement.' });
                    return;
                }

                try {
                    // Get the announcement channel
                    const announcementChannel = await this.getAnnouncementChannel(guild);

                    // Send the announcement
                    await announcementChannel.send({
                        content: `__**${announcement.title}**__\n${announcement.description}\n>>> ${announcement.content}\n\n- ${(await guild.client.users.fetch(announcement.user)).toString()}`,
                        files: announcement.image ? [announcement.image] : []
                    });

                    await interaction.update({ content: `This announcement has been posted.`, components: [] });
                } catch (error) {
                    logger.error(String(error));
                    await interaction.update({ content: 'An error occurred while posting the announcement.' });
                }
            } else if (interaction.customId.startsWith('delete-announcement-')) {
                const id = interaction.customId.split('-')[2];
                await interaction.update({ content: 'Deleting the announcement...' });
                await this.deleteAnnouncement(parseInt(id), guild);
            }
        });
    }

    public async createAnnouncement(title: string, description: string, content: string, user: User, guild: Guild, image?: Attachment): Promise<Announcement | null> {
        // Get the announcement ticket channel
        const ticketsChannel = await this.getAnnouncementTicketsChannel(guild);

        if (!this.collectors.has(guild.id)) {
            // Create the collector for the channel
            const collector = ticketsChannel.createMessageComponentCollector({ componentType: ComponentType.Button });
            this.collectors.set(guild.id, collector);

            // Set up the collector
            await this.setupCollector(this.collectors.get(guild.id), guild);
        }

        const message = await ticketsChannel.send({ content: 'Creating announcement ticket...' }) as Message;

        const announcement = await Database.getInstance().announcements.create(title, description, content, user.id, guild.id, message.id, image?.url);

        if (!announcement) return null;

        this.postAnnouncementTicket(announcement, message, guild, image);

        return announcement;
    }

    private async postAnnouncementTicket(announcement: Announcement, message: Message, guild: Guild, image?: Attachment): Promise<void> {
        // Send the announcement ticket
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`send-announcement-everyone-${announcement.id}`).setLabel('Approve (Everyone)').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`send-announcement-${announcement.id}`).setLabel('Approve').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`delete-announcement-${announcement.id}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
        );

        const embed = new EmbedBuilder()
            .setDescription(`**${announcement.description}**\n\n${announcement.content}`)
            .setTitle(announcement.title)
            .setAuthor({ name: (await guild.client.users.fetch(announcement.user)).username })
            .setTimestamp(announcement.createdAt)
            .setImage(image?.url ?? null)
            .setFooter({ text: `Announcement ID: ${announcement.id}` });

        await message.edit({ content: '', embeds: [embed], components: [row] });
    }

    public async deleteAnnouncement(id: number, guild: Guild): Promise<Announcement | null> {
        const announcement = await Database.getInstance().announcements.delete(id);

        if (!announcement) return null;

        // Get the announcement ticket channel
        const ticketsChannel = await this.getAnnouncementTicketsChannel(guild);

        // Delete the announcement ticket
        const message = await ticketsChannel.messages.fetch(announcement.message);
        await message.delete();

        return announcement;
    }

    public static getInstance(): AnnouncementManager {
        if (!AnnouncementManager.instance) {
            AnnouncementManager.instance = new AnnouncementManager();
        }

        return AnnouncementManager.instance;
    }
}