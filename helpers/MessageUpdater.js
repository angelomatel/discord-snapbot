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
                channel_type = 'DM'
                LIMIT 550`)
                .all().forEach((message) => {
                    setTimeout(() => {
                        BOT.users.fetch(message.channel_id).then((user) => {
                            user.dmChannel.messages.fetch(message.id).then((msg) => {
                                const embed = msg.embeds[0];
                                embed.color = 'BLACK';
                                embed.footer.text = `This item expired `;
                                embed.title = `<:Expired:980862802946318386> ${embed.title}`;

                                msg.edit({ embeds: [embed] })
                                    .then(() => {
                                        // Delete the message from the database
                                        db.prepare(`
                                            DELETE FROM messages
                                            WHERE id = ?
                                            `).run(message.id);
                                    })
                                    .catch((err) => {
                                        Logger.error(`Error editing message ${message.id}: ${err}`);
                                    });
                            }).catch((err) => {
                                Logger.error(`Message ${message.id} not found: ${err}`);
                            });  
                        })
                    }, 75); // Delay to avoid rate limits, only delete up to 13 messages per second
                })
        }, null, true, 'Asia/Manila');

        job.start();
    }
}