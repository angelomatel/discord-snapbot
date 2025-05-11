const Winston = require('winston');

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5,
        item: 99,
    },
    colors: {
        item: 'cyan',
        info: 'green',
        error: 'red',
        warn: 'yellow',
    },
}

const Logger = Winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new Winston.transports.Console({
            level: 'info',
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.simple()
            )
        }),
        new Winston.transports.File({
            filename: 'logs/bot-error.log',
            level: 'error',
            format: Winston.format.combine(
                Winston.format.simple(),
                Winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        }),
        new Winston.transports.File({
            filename: 'logs/bot-info.log',
            level: 'info',
            format: Winston.format.combine(
                Winston.format.simple(),
                Winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        }),
        new Winston.transports.File({
            filename: 'logs/bot-warn.log',
            level: 'warn',
            format: Winston.format.combine(
                Winston.format.timestamp(),
                Winston.format.simple()
            )
        }),
        new Winston.transports.File({
            filename: 'logs/items.log',
            level: 'item',
            format: Winston.format.combine(
                Winston.format.simple(),
                Winston.format.timestamp(),
            )
        }),
        new Winston.transports.Console({
            level: 'item',
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.simple()
            )
        })
    ]
});
Winston.addColors(customLevels.colors);
Logger.item = (item, type) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const expiryTime = new Date(item.EndTime * 1000).toLocaleTimeString('en-US', { hour12: false });
    
    const typeS = type.padStart(15);
    const price = `Ƶ ${item.Price.toLocaleString().padStart(13)}`;

    const itemName = item.FullName.replace('<:Broken:980862802803720242>', '[Broken]');

    Logger.log({
        level: 'item',
        message: `[${currentTime} - ${expiryTime}] ${typeS} | ${price} | ${itemName}`,
    });
}

module.exports = Logger;