CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "notifier" (
	"id"	INTEGER,
	"user_id"	TEXT NOT NULL,
	"guild_id"	TEXT,
	"item_id"	INTEGER NOT NULL,
	"refine"	TEXT,
	"enchant"	TEXT,
	"enchant_level"	TEXT,
	"category_id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("guild_id") REFERENCES "guilds"("id")
);
CREATE TABLE IF NOT EXISTS "channels" (
	"id"	TEXT,
	"guild_id"	TEXT NOT NULL,
	"type"	TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("guild_id") REFERENCES "guilds"("id")
);
CREATE TABLE IF NOT EXISTS "messages" (
	"id"	TEXT,
	"channel_id"	TEXT,
	"channel_type"	TEXT,
	"expiry"	TEXT,
	"order_id"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "guilds" (
	"id"	TEXT,
	"name"	TEXT NOT NULL,
	"active"	INTEGER NOT NULL DEFAULT 0,
	"active_until"	TEXT,
	"notifier"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);
