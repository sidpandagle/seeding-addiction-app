import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the database and create tables
 */
const initDB = async (): Promise<void> => {
  if (dbInstance) return;

  dbInstance = await SQLite.openDatabaseAsync('seeding.db');

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS relapse (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT,
      tags TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_relapse_timestamp ON relapse(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_relapse_tags ON relapse(tags);

    CREATE TABLE IF NOT EXISTS urge (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT,
      context TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_urge_timestamp ON urge(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_urge_context ON urge(context);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
};

/**
 * Initialize and return the database instance
 * This ensures the database is always initialized before use
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!initPromise) {
    initPromise = initDB();
  }
  await initPromise;
  return dbInstance!;
};

/**
 * Create the relapse table if it doesn't exist
 * This is now called automatically by getDatabase
 */
export const initializeDatabase = async (): Promise<void> => {
  await getDatabase();
};

/**
 * Relapse record interface
 */
export interface Relapse {
  id: string;
  timestamp: string; // ISO8601 format
  note?: string;
  tags?: string[]; // Will be stored as JSON string in DB
}

/**
 * Relapse input interface (for creating new records)
 */
export interface RelapseInput {
  timestamp?: string;
  note?: string;
  tags?: string[];
}

/**
 * Urge record interface
 */
export interface Urge {
  id: string;
  timestamp: string; // ISO8601 format
  note?: string;
  context?: string; // e.g., "stress", "boredom", "trigger"
}

/**
 * Urge input interface (for creating new records)
 */
export interface UrgeInput {
  timestamp?: string;
  note?: string;
  context?: string;
}
