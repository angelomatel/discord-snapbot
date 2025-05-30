const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Collection,
    MessageFlags,
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const { connect, snapper } = require('./helpers/websocket');
const Logger = require('./helpers/Logger');
const db = require('./helpers/db');
const SnapMessage = require('./helpers/SnapMessage');

const MessageDeleter = require('./helpers/MessageDeleter');
const MessageUpdater = require('./helpers/MessageUpdater');


const ITEMS = require('./files/items.json');

const BOT = new Client({
    presence: {
        activities: [
            { name: 'the exchange', type: 3 },
            { name: 'with your zeny', type: 0 },
        ],
        status: 'online',
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

BOT.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
        // Register the commands globally
        BOT.commands.set(command.data.name, command);
        // Logger.info(`Loading command ${command.data.name}`);
    } else {
        Logger.error(`Command ${file} is missing a required "data" or "execute" property.`);
    }
}

BOT.on('ready', async () => {
    await BOT.guilds.fetch();

    // const user = await BOT.users.fetch('226720625329176576');
    // let embed = new EmbedBuilder({
    //     title: `(SEA) Snap Bot started ${new Date().toLocaleTimeString('en-US', {hour12: false})}`,
    //     color: 0xFF0000
    // })
    // user.send({embeds: [embed]});
    Logger.info(`Bot Started`);

    connect();
    MessageDeleter.start(BOT);
    MessageUpdater.start(BOT);

    // Set the bot's presence

});

BOT.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = BOT.commands.get(interaction.commandName);

    if (!command) {
        Logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        Logger.error(`Error executing command ${interaction.commandName}: ${error}`);
        Logger.error(error.stack);
        await interaction.reply({
            content: `There was an error while executing this command! \`${error}\``,
            flags: MessageFlags.Ephemeral
        });
    }
});

snapper.on('item', async (item) => {
    // Remove the last 1 character from the item name
    const category = (item.Enchants) ? item.Enchants[3].Enchant.slice(0, -1) : 'None';
    const fourthEnchant = (item.Enchants) ? item.Enchants[3].Enchant : 'None';
    const enchantLevel = (item.Enchants) ? item.Enchants[3].Enchant.slice(-1) : '-1'
    const itemObject = ITEMS[item.ItemId];
    const itemType = itemObject.Type;

    let itemName = '';
        itemName += (item.Broken) ? '<:Broken:980862802803720242> ' : '';
        itemName += (item.RefineLevel > 0) ? `+${item.RefineLevel} ` : '';
        itemName += itemObject.Name;
    item['FullName'] = itemName;

    let imageUrl = (itemObject.Type >= 81 && itemObject.Type <= 87) ?
        `https://borf.github.io/romicons/Cards/${item.ItemId}.png` :
        `https://borf.github.io/romicons/Items/${itemObject.Icon}.png`;
    item['ImageUrl'] = imageUrl;

    // Check if the item has already been sent
    const existingMessage = db.prepare(`
        SELECT messages.id
        FROM messages
        JOIN channels ON messages.channel_id = channels.id
        WHERE messages.order_id = ? AND channels.type = ?
    `).get(item.Orderid, category);

    if (existingMessage) return;

    Logger.item(item, fourthEnchant);
    
    const channels = db.prepare(`
        SELECT channels.id, guilds.id AS guild_id, guilds.name AS guild_name
        FROM channels
        JOIN guilds ON channels.guild_id = guilds.id
        WHERE channels.type = ? AND guilds.active = 1
    `).all(category);

    // For subscribed guilds
    channels.forEach(async (c) => {
        const channelId = c.id;
        const channel = BOT.channels.cache.get(channelId);

        if (channel) {
            const embed = SnapMessage.Channel(item, c.guild_name);
            channel.send({ embeds: [embed] }).then((message) => {
                const messageId = message.id;
                db.prepare(`
                    INSERT INTO messages (id, channel_id, channel_type, order_id, expiry)
                    VALUES (?, ?, ?, ?, ?)
                `).run(messageId, channelId, 'TextChannel', item.Orderid, item.EndTime);
            })
        } else {
            Logger.error(`[${c.guild_name}] Channel with ID ${channelId} not found`);
        }
    });

    // For users with DM subscriptions
    const users = db.prepare(`
        SELECT notifier.user_id, notifier.id
        FROM notifier
        INNER JOIN guilds ON notifier.guild_id = guilds.id
        WHERE guilds.active = 1 AND
        notifier.item_id = ? OR notifier.item_id = 0 AND
        (notifier.refine = ? OR notifier.refine = -1) AND
        (notifier.enchant = ? OR notifier.enchant = 'None') AND
        (notifier.enchant_level = ? OR notifier.enchant_level = -1) AND
        (
            notifier.category_id LIKE '%-%' AND
            CAST(SUBSTR(notifier.category_id, 1, INSTR(notifier.category_id, '-') - 1) AS INTEGER) <= CAST(? AS INTEGER) AND
            CAST(SUBSTR(notifier.category_id, INSTR(notifier.category_id, '-') + 1) AS INTEGER) >= CAST(? AS INTEGER)
        ) OR (
            notifier.category_id NOT LIKE '%-%' AND
            CAST(notifier.category_id AS INTEGER) = CAST(? AS INTEGER)
        )
    `).all(item.ItemId, item.RefineLevel, category, enchantLevel, itemType, itemType, itemType);

    // Logger.debug(`
    //     SELECT notifier.user_id, notifier.id
    //     FROM notifier
    //     INNER JOIN guilds ON notifier.guild_id = guilds.id
    //     WHERE guilds.active = 1 AND
    //     notifier.item_id = '${item.ItemId}' OR notifier.item_id = 0 AND
    //     (notifier.refine = '${item.RefineLevel}' OR notifier.refine = -1) AND
    //     (notifier.enchant = '${category}' OR notifier.enchant = 'None') AND
    //     (notifier.enchant_level = '${enchantLevel}' OR notifier.enchant_level = -1) AND
    //     (
    //         notifier.category_id LIKE '%-%' AND
    //         CAST(SUBSTR(notifier.category_id, 1, INSTR(notifier.category_id, '-') - 1) AS INTEGER) <= CAST('${itemType}' AS INTEGER) AND
    //         CAST(SUBSTR(notifier.category_id, INSTR(notifier.category_id, '-') + 1) AS INTEGER) >= CAST('${itemType}' AS INTEGER)
    //     ) OR (
    //         notifier.category_id NOT LIKE '%-%' AND
    //         CAST(notifier.category_id AS INTEGER) = CAST('${itemType}' AS INTEGER)
    //     )
    // `)

    users.forEach(async (user) => {
        const userId = user.user_id;
        const userObj = await BOT.users.fetch(userId);
        if (userObj) {
            const embed = SnapMessage.User(item, user);
            userObj.send({ embeds: [embed] }).then((message) => {
                const messageId = message.id;
                db.prepare(`
                    INSERT INTO messages (id, channel_id, channel_type, order_id, expiry)
                    VALUES (?, ?, ?, ?, ?)
                `).run(messageId, userId, 'DM', item.Orderid, item.EndTime);
            })
        } else {
            Logger.error(`User with ID ${userId} not found`);
        }
    });

});

BOT.login(process.env.BIG_CATMAN)