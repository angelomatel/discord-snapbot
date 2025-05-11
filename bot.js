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


const ITEMS = require('./files/items.json');

const BOT = new Client({
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
        Logger.info(`Loading command ${command.data.name}`);
    } else {
        Logger.error(`Command ${file} is missing a required "data" or "execute" property.`);
    }
}

BOT.on('ready', async () => {
    await BOT.guilds.fetch();

    // const user = await BOT.users.fetch('226720625329176576');
    // let embed = new EmbedBuilder({
    //     title: `Test started ${new Date().toLocaleTimeString('en-US', {hour12: false})}`,
    //     color: 0xFF0000
    // })
    // user.send({embeds: [embed]});
    Logger.info(`Bot Started`);

    connect();
    MessageDeleter.start(BOT);
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
    const itemObject = ITEMS[item.ItemId];

    let itemName = '';
        itemName += (item.Broken) ? '<:Broken:980862802803720242> ' : '';
        itemName += (item.RefineLevel > 0) ? `+${item.RefineLevel} ` : '';
        itemName += itemObject.Name;
    item['FullName'] = itemName;

    let imageUrl = (itemObject.Type >= 81 && itemObject.Type <= 87) ?
        `https://borf.github.io/romicons/Cards/${item.ItemId}.png` :
        `https://borf.github.io/romicons/Items/${itemObject.Icon}.png`;
    item['ImageUrl'] = imageUrl;

    Logger.item(item, fourthEnchant);
    
    const channels = db.prepare(`
        SELECT channels.id, guilds.id AS guild_id, guilds.name AS guild_name
        FROM channels
        JOIN guilds ON channels.guild_id = guilds.id
        WHERE channels.type = ? AND guilds.active = 1
    `).all(category);

    channels.forEach(async (c) => {
        const channelId = c.id;
        const channel = BOT.channels.cache.get(channelId);

        if (channel) {
            const embed = SnapMessage.Create(item, c.guild_name);
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

});

BOT.login(process.env.BIG_CATMAN)