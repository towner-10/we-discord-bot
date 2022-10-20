import { ChannelType, CommandInteraction, GuildMemberRoleManager, TextChannel, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import AnnouncementManager from "../helpers/announcementManager";

module.exports = {
        data: new SlashCommandBuilder()
                .setName('set-channel')
                .setDescription('Set a channel for the bot to post in')
                .addStringOption(
                    option => 
                        option.setName('channel-type')
                        .setDescription('The type of channel to set')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Announcements', value: 'announcements' },
                            { name: 'Announcement Tickets', value: 'announcement-tickets' },
                        )
                )
                .addChannelOption(
                    option =>
                        option.setName('channel')
                        .setDescription('The channel to set')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                )
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction: CommandInteraction) {
                // Check if the user has the correct role
                const roles = (interaction.member?.roles as GuildMemberRoleManager).cache;
                if (!roles.some(role => role.name === process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'You don\'t have the correct role to do this!', ephemeral: true });

                // Get the channel type and channel
                const channelType = interaction.options.get('channel-type')?.value as string;
                const channel = interaction.options.get('channel')?.channel;
                
                if (!channel) return await interaction.reply({ content: 'Couldn\'t find the channel!', ephemeral: true });
                if (!interaction.guild) return await interaction.reply({ content: 'Couldn\'t find the guild!', ephemeral: true });

                switch (channelType) {
                        case 'announcements':
                            if (!interaction.guild) return await interaction.reply({ content: 'Couldn\'t set the announcements channel! Try again later.', ephemeral: true });

                            // Set the channel in the database
                            try {
                                await AnnouncementManager.getInstance().setAnnouncementChannel(interaction.guild, channel as TextChannel);
                            } catch (error) {
                                return await interaction.reply({ content: 'Couldn\'t set the announcements channel! Try again later.', ephemeral: true });
                            }
                            
                            return await interaction.reply({ content: `Successfully set the announcements channel to ${channel}!`, ephemeral: true });
                        case 'announcement-tickets':
                            if (!interaction.guild) return await interaction.reply({ content: 'Couldn\'t set the announcement tickets channel! Try again later.', ephemeral: true });

                            // Set the channel in the database
                            try {
                                await AnnouncementManager.getInstance().setAnnouncementTicketsChannel(interaction.guild, channel as TextChannel);
                            } catch (error) {
                                return await interaction.reply({ content: `Couldn't set the announcement tickets channel! Try again later.`, ephemeral: true });
                            }
                            
                            return await interaction.reply({ content: `Successfully set the announcement tickets channel to ${channel}!`, ephemeral: true });
                }

                return await interaction.reply({ content: 'Couldn\'t set the channel! Try again later.', ephemeral: true });
        },
};