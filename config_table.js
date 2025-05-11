const db = require('better-sqlite3')('db/config.db');

db.exec(`DROP TABLE IF EXISTS guilds`);
db.exec(`CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0,
    active_until TEXT NULL
)`);

db.exec(`DROP TABLE IF EXISTS channels`);
db.exec(`CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL REFERENCES guilds(id),
    type TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL REFERENCES guilds(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS notifier (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    refine TEXT NULL,
    enchant TEXT NULL,
    enchant_level TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
   )`);