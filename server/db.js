const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "data", "berlin-sublet.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    price_month INTEGER NOT NULL,
    rooms INTEGER NOT NULL,
    size_m2 INTEGER NOT NULL,
    available_from TEXT NOT NULL,
    available_until TEXT NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    photos TEXT NOT NULL DEFAULT '[]',
    is_furnished INTEGER NOT NULL DEFAULT 0,
    is_direct_only INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings (id)
  );

  CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
  CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
  CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
`);

module.exports = db;
