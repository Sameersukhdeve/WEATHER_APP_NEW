// ============================================================
// config/db.js
// ============================================================
// SQLite database configuration for serverless deployment.
// Uses sqlite3 async API which works on Windows and Vercel.
// ============================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use /tmp on Vercel, ./data locally
const dbDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'weather.db');

// Create data directory if it doesn't exist (local only)
if (!process.env.VERCEL && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// ============================================================
// initializeDatabase()
// Creates tables if they don't exist.
// ============================================================
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS weather_records (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        location        TEXT NOT NULL,
        country         TEXT,
        temperature     REAL,
        feels_like      REAL,
        humidity        INTEGER,
        wind_speed      REAL,
        weather_description TEXT,
        weather_icon    TEXT,
        date_range_start TEXT,
        date_range_end   TEXT,
        raw_forecast    TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Database initialization failed:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLite database initialized.');
        resolve();
      }
    });
  });
};

module.exports = { db, initializeDatabase };

