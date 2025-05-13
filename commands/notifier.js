const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

const db = require('../helpers/db');
const Logger = require('../helpers/Logger');

const ITEMS = require('../files/items.json');
const CATEGORIES = {
    '170-320': 'Weapons',
    '500': 'Armor',
    '510-515': 'Offhand Shield',
    '520': 'Garments',
    '530': 'Footgears',
    '540': 'Accessory',
    '800': 'Headwear',
    '830': 'Face',
    '850': 'Mouth',
    '810': 'Back',
    '840': 'Tail',
    '90': 'Mounts',
    '47': 'Premium Cards',
    '50': 'Blueprints (Any)',
    '72': 'Materials'
}

function findItem(itemName) {
    const item = Object.values(ITEMS).find(item => item.Name.replace('’', '\'').toLowerCase() === itemName.toLowerCase());
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
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('category')
                .setDescription('Adds an entire category of items to your notifier list')
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('The category of items to add to your notifier list')
                        .setRequired(true)
                        .addChoices(
                            // Weapons 170-320
                            // Offhands 510-515
                            { name: 'Weapon', value: '170-320' },
                            { name: 'Armor', value: '500' },
                            { name: 'Offhand Shield', value: '510-515' },
                            { name: 'Garments', value: '520' },
                            { name: 'Footgears', value: '530' },
                            { name: 'Accessory', value: '540' },
                            { name: 'Headwear', value: '800' },
                            { name: 'Face', value: '830' },
                            { name: 'Mouth', value: '850' },
                            { name: 'Back', value: '810' },
                            { name: 'Tail', value: '840' },
                            { name: 'Mounts', value: '90' },
                            { name: 'Premium Cards', value: '47' },
                            { name: 'Blueprints (Any)', value: '50' },
                            { name: 'Materials', value: '72' },
                        )
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
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (!interaction.guild && ['add', 'category'].includes(subcommand)) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                flags: MessageFlags.Ephemeral
            });
        }

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
                    (user_id, guild_id, item_id, refine, enchant, enchant_level)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(interaction.user.id, interaction.guild.id, item.Id, refineLevel, enchant, enchantLevel);

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
                        { name: 'Enchant Level', value: `${(enchant !== 'None') ? enchantLevel : 'N/A'}`, inline: true }
                    )
                    .setTimestamp();

                Logger.info(`User ${interaction.user.displayName} (${interaction.user.id}) added item ${item.Name} (${item.Id}) to notifier list.`);
                await interaction.reply({ embeds: [addEmbed], flags: MessageFlags.Ephemeral });

                break;
            case 'remove':
                const query = db.prepare(`
                    SELECT *
                    FROM notifier
                    WHERE id = ? AND user_id = ?
                `).get(notifierId, interaction.user.id)

                if (!query) {
                    return interaction.reply({
                        content: `Notifier ID \`${notifierId}\` under your profile not found.`,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    db.prepare(`
                        DELETE FROM notifier
                        WHERE id = ?
                    `).run(notifierId);

                    let removeEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTimestamp()
                        .addFields(
                            { name: 'Refine Level', value: `${(query.refine > 0) ? query.refine : 'Any'}`, inline: true },
                            { name: 'Enchant', value: `${query.enchant}`, inline: true },
                            { name: 'Enchant Level', value: `${(query.enchant !== 'None') ? query.enchant_level : 'N/A'}`, inline: true }
                        );

                    if(query.item_id == 0) {
                        removeEmbed.setTitle('Category Removed from Notifier')
                        removeEmbed.setDescription(`You have removed **${CATEGORIES[query.category_id]}** from your notifier list.`)

                        Logger.info(`User ${interaction.user.displayName} (${interaction.user.id}) removed category ${CATEGORIES[query.category_id]} (${query.category_id}) from notifier list.`);
                    } else {
                        const item = ITEMS[query.item_id];
                        let imageUrl = (item.Type >= 81 && item.Type <= 87) ?
                            `https://borf.github.io/romicons/Cards/${item.Id}.png` :
                            `https://borf.github.io/romicons/Items/${item.Icon}.png`;

                        removeEmbed.setTitle('Item Removed from Notifier')
                        removeEmbed.setDescription(`You have removed **${item.Name}** from your notifier list.`)
                        removeEmbed.setThumbnail(imageUrl)

                        Logger.info(`User ${interaction.user.displayName} (${interaction.user.id}) removed item ${item.Name} (${item.Id}) from notifier list.`);
                    }

                    await interaction.reply({ embeds: [removeEmbed], flags: MessageFlags.Ephemeral });
                }
                
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
                    if (row.item_id == 0) {
                        items.push({
                            id: row.id,
                            name: CATEGORIES[row.category_id],
                            refine: row.refine,
                            enchant: row.enchant,
                            enchant_level: row.enchant_level
                        });
                    } else {
                        const item = ITEMS[row.item_id];
                        items.push({
                            id: row.id,
                            name: item.Name,
                            refine: row.refine,
                            enchant: row.enchant,
                            enchant_level: row.enchant_level
                        });
                    }
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
            case 'category':
                db.prepare(`
                    INSERT INTO notifier
                    (user_id, guild_id, item_id, refine, enchant, enchant_level, category_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(interaction.user.id, interaction.guild.id, 0, refineLevel, enchant, enchantLevel, interaction.options.getString('category'));

                const categoryEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Category Added to Notifier')
                    .setDescription(`You have added a category to your notifier list.`)
                    .addFields(
                        { name: 'Category', value: `${CATEGORIES[interaction.options.getString('category')]}`, inline: true }
                    )
                    .setTimestamp();

                Logger.info(`User ${interaction.user.displayName} (${interaction.user.id}) added category ${CATEGORIES[interaction.options.getString('category')]} to notifier list.`);
                await interaction.reply({ embeds: [categoryEmbed], flags: MessageFlags.Ephemeral });
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