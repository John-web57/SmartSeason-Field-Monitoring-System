import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/smartseason.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'field_agent')),
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fields table
    db.run(`
      CREATE TABLE IF NOT EXISTS fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cropType TEXT NOT NULL,
        plantingDate TEXT NOT NULL,
        currentStage TEXT NOT NULL CHECK(currentStage IN ('planted', 'growing', 'ready', 'harvested')),
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'at_risk', 'completed')),
        assignedAgentId INTEGER,
        latitude REAL,
        longitude REAL,
        acreage REAL,
        description TEXT,
        expectedHarvestDate TEXT,
        harvestDate TEXT,
        yield REAL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedAgentId) REFERENCES users(id)
      )
    `);

    // Field updates table
    db.run(`
      CREATE TABLE IF NOT EXISTS fieldUpdates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fieldId INTEGER NOT NULL,
        agentId INTEGER NOT NULL,
        stage TEXT NOT NULL CHECK(stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fieldId) REFERENCES fields(id) ON DELETE CASCADE,
        FOREIGN KEY (agentId) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');
  });
};

export default db;
