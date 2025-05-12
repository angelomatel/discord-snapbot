const Winston = require('winston');

const Logger = Winston.createLogger({
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
                Winston.format.timestamp(),
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
                Winston.format.timestamp(),
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
                Winston.format.simple(),
                Winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                })
            )
        }),
    ]
});

const item = (item, type) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const expiryTime = new Date(item.EndTime * 1000).toLocaleTimeString('en-US', { hour12: false });
    
    const typeS = type.padStart(15);
    const price = `Ƶ ${item.Price.toLocaleString().padStart(13)}`;

    const itemName = item.FullName.replace('<:Broken:980862802803720242>', '[Broken]');

    Logger.log({
        level: 'info',
        message: `[${currentTime} - ${expiryTime}] ${typeS} | ${price} | ${itemName}`,
    });
}

module.exports = {
    info: (message) => {
        Logger.info(message);
    },
    error: (message) => {
        Logger.error(message);
    },
    warn: (message) => {
        Logger.warn(message);
    },
    item: item,
};