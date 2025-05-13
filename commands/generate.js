const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const db = require('../helpers/db');
const Logger = require('../helpers/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Admin Command: Create notifier channels for this or a specified server')
        .addStringOption(option =>
            option
                .setName('guild_id')
                .setDescription('The guild ID to activate')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                ephemeral: true
            });
        }

        if(interaction.user.id !== "226720625329176576") {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const CHANNEL_NAMES = {
            AntiMage: 'anti-mage',
            Arcane: 'arcane',
            Arch: 'arch',
            Armor: 'armor',
            ArmorBreaking: 'armor-breaking',
            Blasphemy: 'blasphemy',
            DivineBlessing: 'divine-blessing',
            Insight: 'insight',
            Magic: 'magic',
            Morale: 'morale',
            Sharp: 'sharp',
            SharpBlade: 'sharp-blade',
            Tenacity: 'tenacity',
            Zeal: 'zeal',
            None: 'uncommon-items',
        }

        const guildId = interaction.options.getString('guild_id') || interaction.guild.id;
        const guildName = interaction.client.guilds.cache.get(guildId)?.name || interaction.guild.name;

        const guild = await interaction.client.guilds.fetch(guildId).catch(err => {
            Logger.error(`Error fetching guild ${guildId}: ${err}`);
        })

        if (!guild) {
            return interaction.reply({
                content: `Guild with ID ${guildId} not found.`,
                ephemeral: true
            });
        }

        const error = {
            isError: false,
            missingChannels: [],
            existingChannels: [],
            messages: []
        }

        /**
         * Creates a channel in the server and adds it to the database
         * @param {String} channelname anti-mage
         * @param {String} type AntiMage
         * @returns {Promise<Channel>}
         */
        const createChannel = (channelname, type, categoryid) => {
            return new Promise((resolve, reject) => {
                guild.channels.create({
                    name: channelname,
                    type: ChannelType.GuildText,
                    parent: categoryid
                }).then((channel) => {
                    Logger.info(`[${guildId}/${guildName}] Created channel: ${channel.name} (${channel.id})`);
                    db.prepare('INSERT INTO channels (id, guild_id, type) VALUES (?, ?, ?)').run(channel.id, guildId, type);
                    resolve(channel);
                }).catch((error) => {
                    Logger.error(`[${guildId}/${guildName}] Error creating channel ${channelname}: ${error}`);
                    reject(error);
                });
            });
        }

        // Check if the guild already exists in the database
        if(db.prepare('SELECT * FROM guilds WHERE id = ?').get(guildId)) {
            Logger.info(`[${guildId}/${guildName}] Guild already exists in the database`);
            error.isError = true;
            error.messages.push('Guild already exists in the database');
        } else {
            Logger.info(`[${guildId}/${guildName}] Added guild to the database`);
            db.prepare('INSERT INTO guilds (id, active, name) VALUES (?, ?, ?)').run(guildId, 0, guildName);
        }

        await interaction.reply(`Creating channels for \`${guildName}\`...`);

        // Check if the channels already exist in the database
        const channels = db.prepare('SELECT * FROM channels WHERE guild_id = ?').all(guildId);
        if(channels.length > 0) {
            channels.forEach((channel) => {
                if(channel.type in CHANNEL_NAMES) {
                    error.existingChannels.push(CHANNEL_NAMES[channel.type]);
                } else {
                    error.missingChannels.push(CHANNEL_NAMES[channel.type]);
                }
            });
        }

        // Check if the channels already exist in the server
        const existingChannels = guild.channels.cache.filter((channel) => {
            return channel.type === ChannelType.GuildText && channel.parentId === null;
        });

        if(existingChannels.size > 0) {
            existingChannels.forEach((channel) => {
                if(channel.name in CHANNEL_NAMES) {
                    error.existingChannels.push(channel.name);
                } else {
                    error.missingChannels.push(channel.name);
                }
            });
        }

        // Create the channels if they do not exist
        const category = await guild.channels.create({
            name: '💸 Snap Channels',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
        });

        const channelPromises = Object.keys(CHANNEL_NAMES).map((key) => {
            const channelName = CHANNEL_NAMES[key];
            if (!error.existingChannels.includes(channelName)) {
                return createChannel(channelName, key, category.id);
            }
        });
        await Promise.all(channelPromises);
        Logger.info(`[${guildId}/${guildName}] Created channels: ${Object.keys(CHANNEL_NAMES).join(', ')}`);

        await interaction.editReply(`Created channels for \`${guildName}\``);
        if (error.isError && error.existingChannels.length > 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error creating channels')
                .setDescription(`The following channels already exist: \`${error.existingChannels.join(', ')}\``)
                .addFields(
                    { name: 'Existing Channels', value: `\`${error.existingChannels.join(', ')}\``, inline: true }
                )
                .setTimestamp();
            await interaction.followUp({ embeds: [embed] });
        }
    }
}