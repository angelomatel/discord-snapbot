const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

const ITEMS = require('../files/items.json');

const db = require('../helpers/db');
const Logger = require('../helpers/Logger');

function findItem(itemName) {
    itemName = itemName.replace('\'', '’');
    const item = Object.values(ITEMS).find(item => item.Name.toLowerCase() === itemName.toLowerCase());
    if (item) {
        return item;
    } else {
        const similarItems = Object.values(ITEMS).filter(item => item.Name.toLowerCase().includes(itemName.toLowerCase()));
        if (similarItems.length > 0) {
            // Limit the number of similar items to 8
            const limitedSimilarItems = similarItems.slice(0, 8);
            return limitedSimilarItems
        } else {
            return null; // No item found
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notifier')
        .setDescription('Base command for notifier')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds an item to your notifier list')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item to add to your notifier list')
                        .setRequired(true)
                    )
                .addStringOption(option =>
                    option.setName('refine')
                        .setDescription('The refine level of the item (If applicable)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Any', value: '-1' },
                            { name: '1', value: '1' },
                            { name: '2', value: '2' },
                            { name: '3', value: '3' },
                            { name: '4', value: '4' },
                            { name: '5', value: '5' },
                            { name: '6', value: '6' },
                            { name: '7', value: '7' },
                            { name: '8', value: '8' },
                            { name: '9', value: '9' },
                            { name: '10', value: '10' },
                            { name: '11', value: '11' },
                            { name: '12', value: '12' },
                            { name: '13', value: '13' },
                            { name: '14', value: '14' },
                            { name: '15', value: '15' }
                        )
                    )
                .addStringOption(option =>
                    option.setName('enchant')
                        .setDescription('The fourth enchant of the item (If applicable)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Any/None', value: 'None' },
                            { name: 'Anti-Mage', value: 'AntiMage' },
                            { name: 'Arcane', value: 'Arcane' },
                            { name: 'Arch', value: 'Arch' },
                            { name: 'Armor', value: 'Armor' },
                            { name: 'Armor Breaking', value: 'ArmorBreaking' },
                            { name: 'Blasphemy', value: 'Blasphemy' },
                            { name: 'Divine Blessing', value: 'DivineBlessing' },
                            { name: 'Insight', value: 'Insight' },
                            { name: 'Magic', value: 'Magic' },
                            { name: 'Morale', value: 'Morale' },
                            { name: 'Sharp', value: 'Sharp' },
                            { name: 'Sharp Blade', value: 'SharpBlade' },
                            { name: 'Tenacity', value: 'Tenacity' },
                            { name: 'Zeal', value: 'Zeal' }
                        )
                    )
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('The fourth enchant level of the item (If applicable)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Any', value: '-1' },
                            { name: '1 or higher', value: '1' },
                            { name: '2 or higher', value: '2' },
                            { name: '3 or higher', value: '3' },
                            { name: '4', value: '4' },
                        )
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes an item from your notifier list')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the notifier item to remove from your list')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Displays all items in your notifier list')
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clears all items from your notifier list')
        ),

    async execute(interaction) {
        // if (!interaction.guild) {
        //     return interaction.reply({
        //         content: 'This command can only be used in a server.',
        //         ephemeral: true
        //     });
        // }

        const subcommand = interaction.options.getSubcommand();
        const itemName = interaction.options.getString('item');
        const notifierId = interaction.options.getString('id');
        const refineLevel = interaction.options.getString('refine') || '-1';
        const enchant = interaction.options.getString('enchant') || 'None';
        const enchantLevel = interaction.options.getString('level') || '-1';

        switch (subcommand) {
            case 'add':
                // Try to find the item in the database
                const item = findItem(itemName);
                if (!item) {
                    return interaction.reply({
                        content: `Item "${itemName}" not found.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
                if (Array.isArray(item)) {
                    return interaction.reply({
                        content: `Multiple items found!`
                            + `\nPlease be more specific. Here are some suggestions:\n`
                            + item.map(i => `- \`${i.Name}\``).join('\n'),
                        flags: MessageFlags.Ephemeral
                    });
                }

                db.prepare(`
                    INSERT INTO notifier
                    (user_id, item_id, refine, enchant, enchant_level)
                    VALUES (?, ?, ?, ?, ?)
                `).run(interaction.user.id, item.Id, refineLevel, enchant, enchantLevel);

                let imageUrl = (item.Type >= 81 && item.Type <= 87) ?
                    `https://borf.github.io/romicons/Cards/${item.Id}.png` :
                    `https://borf.github.io/romicons/Items/${item.Icon}.png`;

                const addEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Item Added to Notifier')
                    .setDescription(`You have added **${item.Name}** to your notifier list.`)
                    .setThumbnail(imageUrl)
                    .addFields(
                        { name: 'Refine Level', value: `${(refineLevel > 0) ? refineLevel : 'Any'}`, inline: true },
                        { name: 'Enchant', value: `${enchant}`, inline: true },
                        { name: 'Enchant Level', value: `${(enchant === 'None') ? enchantLevel : 'N/A'}`, inline: true }
                    )
                    .setTimestamp();

                Logger.info(`User ${interaction.user.displayName} (${interaction.user.id}) added item ${item.Name} (${item.Id}) to notifier list.`);
                await interaction.reply({ embeds: [addEmbed], flags: MessageFlags.Ephemeral });

                break;
            case 'remove':
                
                break;
            case 'list':
                const listEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Notifier List')
                    .setTimestamp();

                let items = [];

                db.prepare(`
                    SELECT *
                    FROM notifier
                    WHERE user_id = ?
                `).all(interaction.user.id).map((row) => {
                    const item = ITEMS[row.item_id];
                    items.push({
                        id: row.id,
                        name: item.Name,
                        refine: row.refine,
                        enchant: row.enchant,
                        enchant_level: row.enchant_level
                    });
                })

                if (items.length > 0) {
                    listEmbed.setDescription('Here are the items in your notifier list:\n' +
                        items.map((item) => {
                            return `- ID: \`${item.id}\` | `+
                                `${(item.refine > 0) ? `+${item.refine} ` : ''}` +
                                `${item.name} ` +
                                `${(item.enchant !== 'None') ? `| ${item.enchant} (${(item.enchant_level == 4) ? item.enchant_level : `${item.enchant_level} or higher`})` : ''}`;
                        }).join('\n')
                    )
                } else {
                    listEmbed.setDescription('Your notifier list is empty. Use `/notifier add` to add items.');
                }

                await interaction.reply({ embeds: [listEmbed], flags: MessageFlags.Ephemeral });
                break;
            case 'clear':
                db.prepare(`
                    DELETE FROM notifier
                    WHERE user_id = ?
                `).run(interaction.user.id);
                const clearEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Notifier List Cleared')
                    .setDescription('All items have been removed from your notifier list.')
                    .setTimestamp();

                await interaction.reply({ embeds: [clearEmbed], flags: MessageFlags.Ephemeral });
                Logger.info(`User ${interaction.user.name} (${interaction.guild.id}/${interaction.user.id}) cleared their notifier list.`);
                break;
            default:
                await interaction.reply({
                    content: 'Invalid subcommand.',
                    flags: MessageFlags.Ephemeral
                });
                break;
        }
    }

}