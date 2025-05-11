const Logger = require('../helpers/Logger');
const db = require('better-sqlite3')('./db/config.db');

// Log information about the database connection
Logger.info('Connected to the database');

module.exports = db;