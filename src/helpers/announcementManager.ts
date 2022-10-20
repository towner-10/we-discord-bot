import { Announcement } from "@prisma/client";
import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelType, Client, ComponentType, EmbedBuilder, Guild, InteractionCollector, Message, TextChannel, User } from "discord.js";
import Database from "./database";

export default class AnnouncementManager {

    private static instance: AnnouncementManager;

    private collectors: Map<string, InteractionCollector<ButtonInteraction<CacheType>>>;
    private database: Database;

    private constructor() {
        this.database = Database.getInstance();
        this.collectors = new Map<string, InteractionCollector<ButtonInteraction<CacheType>>>();
    }

    public async init(client: Client): Promise<void> {
        const announcements = await this.database.getAnnouncements();

        if (!announcements) return;

        announcements.forEach((announcement) => {
            client.guilds.fetch(announcement.guild).then(async (guild) => {
                // If the collector for the guild already exists, return
                if (this.collectors.has(announcement.guild)) return;

                // Get the announcement ticket channel
                const ticketsChannel = await this.getAnnouncementTicketsChannel(guild);
                
                // Create the collector for the channel
                const collector = ticketsChannel.createMessageComponentCollector({ componentType: ComponentType.Button });
                this.collectors.set(announcement.guild, collector);

                // Set up the collector
                await this.setupCollector(this.collectors.get(announcement.guild), guild);
            });
        });
    }

    private async getAnnouncementTicketsChannel(guild: Guild): Promise<TextChannel> {
        // Get the announcement ticket channel
        let ticketsChannel = guild.channels.cache.find(channel => channel.name === 'announcement-tickets') as TextChannel;

        // If the channel doesn't exist, create it
        if (!ticketsChannel) {
            ticketsChannel = await guild.channels.create({
                name: 'announcement-tickets',
                type: ChannelType.GuildText,
                topic: 'Announcement tickets are created here.',
                reason: 'Announcement tickets channel does not exist.'
            });
        }

        return ticketsChannel;
    }

    private async getAnnouncementChannel(guild: Guild): Promise<TextChannel> {
        // Get the announcement channel
        let announcementChannel = guild.channels.cache.find(channel => channel.name === 'announcements') as TextChannel;

        // If the channel doesn't exist, create it
        if (!announcementChannel) {
            announcementChannel = await guild.channels.create({
                name: 'announcements',
                type: ChannelType.GuildText
            });
        }

        return announcementChannel;
    }

    private async setupCollector(collector: InteractionCollector<ButtonInteraction<CacheType>> | undefined, guild: Guild): Promise<void> {
        if (!collector) return;

        // Set up the collector
        collector.on('collect', async (interaction) => {
            if (interaction.customId.startsWith('send-announcement-')) {
                const id = interaction.customId.split('-')[2];

                const announcement = await this.database.getAnnouncement(parseInt(id));

                if (!announcement) {
                    await interaction.update({ content: 'An error occurred while posting the announcement.' });
                    return;
                }

                // Get the announcement channel
                const announcementChannel = await this.getAnnouncementChannel(guild);

                // Send the announcement
                await announcementChannel.send({
                    content: `@everyone\n\n__**${announcement.title}**__\n${announcement.description}\n\n>>> ${announcement.content}\n\n- ${(await guild.client.users.fetch(announcement.user)).toString()}`,
                    files: announcement.image ? [announcement.image] : []
                });
            
                await interaction.update({ content: `This has been posted.`, components: [] });
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

        const announcement = await Database.getInstance().createAnnouncement(title, description, content, user.id, guild.id, message.id, image?.url);

        if (!announcement) return null;

        // Send the announcement ticket
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`send-announcement-${announcement.id}`).setLabel('Approve').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`delete-announcement-${announcement.id}`).setLabel('Remove').setStyle(ButtonStyle.Secondary),
        );

        const embed = new EmbedBuilder()
            .setDescription(`**${announcement.description}**\n\n${announcement.content}`)
            .setTitle(announcement.title)
            .setAuthor({ name: (await guild.client.users.fetch(announcement.user)).username })
            .setTimestamp(announcement.createdAt)
            .setImage(image?.url ?? null)
            .setFooter({ text: `Announcement ID: ${announcement.id}` });

        await message.edit({ content: '', embeds: [embed], components: [row] });

        return announcement;
    }

    public async deleteAnnouncement(id: number, guild: Guild): Promise<Announcement | null> {
        const announcement = await Database.getInstance().deleteAnnouncement(id);

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