const { CronJob } = require('cron');
const db = require('./db');
const Logger = require('./Logger');

module.exports = {
    start: (BOT) => {
        const job = new CronJob('* * * * *', async () => {
            db.prepare(`
                SELECT *
                FROM messages
                WHERE unixepoch() > expiry AND
                channel_type = 'TextChannel'
                LIMIT 800`)
                .all().forEach((message) => {
                    setTimeout(() => {
                        BOT.channels.fetch(message.channel_id).then((channel) => {
                            channel.messages.fetch(message.id).then((msg) => {
                                db.prepare(`
                                DELETE FROM messages
                                WHERE id = ?
                                `).run(message.id);
                                msg.delete()
                                    // .then(() => {
                                    //     Logger.info(`Deleted message ${message.id} from channel ${message.channel_id}`);
                                    // })
                                    .catch((err) => {
                                        Logger.error(`Error deleting message ${message.id}: ${err}`);
                                    });
                            }).catch((err) => {
                                Logger.error(`Message ${message.id} not found: ${err}`);
                            });
                        }).catch((err) => {
                            Logger.error(`Error fetching channel ${message.channel_id}: ${err}`);
                        });
                    }, 50); // Delay to avoid rate limits, only delete up to 20 messages per second
                })
        }, null, true, 'Asia/Manila');

        job.start();
    }
}