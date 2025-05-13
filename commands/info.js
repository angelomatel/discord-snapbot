const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

const db = require('../helpers/db');

const formatMemoryUsage = (bytes) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Admin Command: Get information about the bot'),
    async execute(interaction) {
        if(interaction.user.id !== "226720625329176576") {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const memoryData = process.memoryUsage();
        const guilds = await db.prepare(`
            SELECT *
            FROM guilds
            WHERE active = 1
            `).all();

        // Display all guilds
        const embed = new EmbedBuilder()
            .setTitle('Bot Information')
            .setColor(0xFF0000)
            .setDescription(
                `Total Guilds: \`${guilds.length}\`` +
                guilds.map(guild => {
                    return `\n- **${guild.name}**${(guild.notifier == 1) ? ' (with notifier)' : ''} - Active until \`${new Date(parseInt(guild.active_until)).toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'long' })}\``;
                }).join('')
            )
            .addFields(
                { name: 'Memory Usage', value: `${formatMemoryUsage(memoryData.heapUsed)}`, inline: true },
                { name: 'Uptime', value: `${Math.round(process.uptime())} seconds`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        }        
            
}