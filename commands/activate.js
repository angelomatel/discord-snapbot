const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

const db = require('../helpers/db');
const Logger = require('../helpers/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activate')
        .setDescription('Admin Command: Activate guild subscription')
        .addStringOption(option =>
            option
                .setName('guild_id')
                .setDescription('The guild ID to activate')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('Duration of the subscription (1w, 1m, 1y) defaults to 1m')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName('notifier')
                .setDescription('Enable notifier for this guild')
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

        const guildId = interaction.options.getString('guild_id') || interaction.guild.id;
        const duration = interaction.options.getString('duration') || '1m';
        const notifier = interaction.options.getBoolean('notifier') || false;

        const guild = await interaction.client.guilds.fetch(guildId).catch(err => {
            Logger.error(`Error fetching guild ${guildId}: ${err}`);
            return null;
        });

        if (!guild) {
            return interaction.reply({
                content: `Guild with ID ${guildId} not found.`,
                ephemeral: true
            });
        }

        const durationMap = {
            's': 1000,
            'd': 24 * 60 * 60 * 1000,
            'w': 7 * 24 * 60 * 60 * 1000,
            'm': 30 * 24 * 60 * 60 * 1000,
            'y': 365 * 24 * 60 * 60 * 1000
        };
        const durationUnit = duration.slice(-1);
        const durationValue = parseInt(duration.slice(0, -1), 10);

        if (isNaN(durationValue) || !durationMap[durationUnit]) {
            return interaction.reply({
                content: 'Invalid duration format. Use `1w`, `1m`, or `1y`.',
                ephemeral: true
            });
        }

        const durationInMs = durationValue * durationMap[durationUnit];

        // Check if the guild is already activated
        const dbGuild = await db.prepare('SELECT * FROM guilds WHERE id = ?').get(guildId);
        let activeDate;
        let activeNotifer;

        if (dbGuild) {
            dbGuild.active = 1;
            dbGuild.active_until = (Date.now() > dbGuild.active_until) ? 
                Date.now() + durationInMs : 
                parseInt(dbGuild.active_until) + durationInMs;
            dbGuild.notifier = (dbGuild.notifier == 1 || notifier) ? 1 : 0;

            db.prepare('UPDATE guilds SET active = ?, active_until = ?, notifier = ? WHERE id = ?')
                .run(dbGuild.active, dbGuild.active_until, dbGuild.notifier, guildId);

            Logger.info(`Guild ${guildId} activated until ${new Date(dbGuild.active_until)}`);
            activeDate = new Date(dbGuild.active_until);
            activeNotifer = (dbGuild.notifier == 1) ? 'Enabled' : 'Disabled';
        } else {
            const guildName = interaction.client.guilds.cache.get(guildId).name;

            db.prepare('INSERT INTO guilds (id, name, active, active_until, notifier) VALUES (?, ?, ?, ?, ?)')
                .run(guildId, guildName, 1, Date.now() + durationInMs, notifier ? 1 : 0);

            Logger.info(`Guild ${guildId} activated for the first time until ${new Date(Date.now() + durationInMs)}`);
            activeDate = new Date(Date.now() + durationInMs);
            activeNotifer = notifier ? 'Enabled' : 'Disabled';
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Guild Subscription Activated')
            .setDescription(`Guild \`${guild.name}\` has been activated for \`${duration}\`.`)
            .addFields(
                { name: 'Active Until', value: activeDate.toLocaleString(), inline: true },
                { name: 'Notifier', value: activeNotifer, inline: true }
            )
            .setTimestamp()

        await interaction.reply({ embeds: [embed] });

    }

}