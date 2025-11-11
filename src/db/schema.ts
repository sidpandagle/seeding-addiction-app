import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the database and create tables
 */
const initDB = async (): Promise<void> => {
  if (dbInstance) return;

  dbInstance = await SQLite.openDatabaseAsync('seeding.db');

  // Create base tables without new columns
  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS relapse (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT,
      tags TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_relapse_timestamp ON relapse(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_relapse_tags ON relapse(tags);

    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp TEXT NOT NULL,
      note TEXT,
      category TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_category ON activity(category);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Migration: Update existing single-category data to array format
  // This is backward compatible - we'll handle both formats in the helpers
  try {
    const existingActivities = await dbInstance.getAllAsync<{ id: string; category: string | null }>(
      'SELECT id, category FROM activity WHERE category IS NOT NULL AND category NOT LIKE \'[%\''
    );

    for (const activity of existingActivities) {
      if (activity.category && !activity.category.startsWith('[')) {
        // Convert single category to JSON array
        const categoryArray = JSON.stringify([activity.category]);
        await dbInstance.runAsync(
          'UPDATE activity SET category = ? WHERE id = ?',
          [categoryArray, activity.id]
        );
      }
    }
  } catch (error) {
    // Table might be empty or migration already done, ignore
  }
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
 * Activity record interface
 */
export interface Activity {
  id: string;
  timestamp: string; // ISO8601 format
  note?: string;
  categories?: string[]; // Multiple categories (e.g., ["🏃 Physical", "👥 Social"])
}

/**
 * Activity input interface (for creating new records)
 */
export interface ActivityInput {
  timestamp?: string;
  note?: string;
  categories?: string[];
}
