const WebSocketClient = require('websocket').client;
const wsClient = new WebSocketClient();
const wsUrl = process.env.ROM_API_WS_URL;

const EveentEmitter = require('events');
const eventEmitter = new EveentEmitter();

const Logger = require('./Logger');

wsClient.on('connect', (connection) => {
    Logger.info('WebSocket Client Connected');

    connection.on('error', (error) => {
        Logger.error(`Connection Error: ${error.toString()}`);
        setTimeout(() => {
            Logger.info('Reconnecting to WebSocket...');
            connect();
        }, 1000);
    });
    connection.on('close', () => {
        Logger.info('WebSocket Client Disconnected');
        setTimeout(() => {
            Logger.info('Reconnecting to WebSocket...');
            connect();
        }, 1000);
    });
    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data)
        const item_id = data.Data.Result.ItemId;

        data.Data.Result.Data.forEach((item) => {
            if (item.EndTime) {
                if (item.Enchants) {
                    if (item.Enchants[3].Enchant.endsWith('_')) // Get around the game's extra enchantment
                        item.Enchants[3].Enchant = item.Enchants[3].Enchant.replace(/_/g, '');
                }

                item = { ItemId: item_id, ...item }
                eventEmitter.emit('item', item);
            }
        })
    });

    connection.send(JSON.stringify({
        Action: 'SetServers',
        Servers: [ 'SEAEL' ]
    }));
    
    connection.send(JSON.stringify({
        Action: 'SetNotifications',
        Notifications: [ 'Exchange' ]
    }));
});

wsClient.on('connectFailed', (error) => {
    Logger.error('Unable to connect to WebSocket: ' + error.toString());
    setTimeout(() => {
        Logger.info('Reconnecting to WebSocket...');
        connect();
    }, 5000);
});

const connect = () => {
    Logger.info('Connecting to WebSocket...');
    wsClient.connect(wsUrl);
}

module.exports = {
    connect,
    snapper: eventEmitter
}