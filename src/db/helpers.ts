import { getDatabase } from './schema';
import type { Relapse, RelapseInput, Activity, ActivityInput } from './schema';
import * as Crypto from 'expo-crypto';
import {
  validateTimestamp,
  sanitizeString,
  validateTags,
  validateNote,
  validateCategory,
  validateJourneyStartDate
} from '../utils/validation';

/**
 * Generate a cryptographically secure UUID v4
 */
const generateUUID = (): string => {
  return Crypto.randomUUID();
};

/**
 * Get the journey start timestamp
 */
export const getJourneyStart = async (): Promise<string | null> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    ['journey_start']
  );

  return result?.value || null;
};

/**
 * Set the journey start timestamp
 */
export const setJourneyStart = async (timestamp: string): Promise<void> => {
  // Validate the journey start date
  const validation = validateJourneyStartDate(timestamp);
  if (validation !== true) {
    throw new Error(validation);
  }

  const db = await getDatabase();

  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    ['journey_start', timestamp]
  );
};

/**
 * Add a new relapse record
 */
export const addRelapse = async (input: RelapseInput): Promise<Relapse> => {
  const db = await getDatabase();

  const id = generateUUID();
  const timestamp = input.timestamp || new Date().toISOString();
  
  // Validate inputs
  const timestampValidation = validateTimestamp(timestamp);
  if (timestampValidation !== true) {
    throw new Error(timestampValidation);
  }
  
  const noteValidation = validateNote(input.note);
  if (noteValidation !== true) {
    throw new Error(noteValidation);
  }
  
  const tagsValidation = validateTags(input.tags);
  if (tagsValidation !== true) {
    throw new Error(tagsValidation);
  }
  
  // Sanitize inputs
  const note = sanitizeString(input.note, 5000) || null;
  const tags = input.tags ? JSON.stringify(input.tags) : null;

  await db.runAsync(
    'INSERT INTO relapse (id, timestamp, note, tags) VALUES (?, ?, ?, ?)',
    [id, timestamp, note, tags]
  );

  return {
    id,
    timestamp,
    note: note || undefined,
    tags: input.tags,
  };
};

/**
 * Get all relapse records, ordered by timestamp (newest first)
 * @param limit - Optional limit for number of records to return (default: all)
 * @param offset - Optional offset for pagination (default: 0)
 */
export const getRelapses = async (limit?: number, offset: number = 0): Promise<Relapse[]> => {
  const db = await getDatabase();

  let query = 'SELECT * FROM relapse ORDER BY timestamp DESC';
  const params: any[] = [];

  if (limit !== undefined) {
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const rows = await db.getAllAsync<{
    id: string;
    timestamp: string;
    note: string | null;
    tags: string | null;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    note: row.note || undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
  }));
};

/**
 * Delete a relapse record by ID
 */
export const deleteRelapse = async (id: string): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM relapse WHERE id = ?', [id]);
};

/**
 * Update a relapse record
 */
export const updateRelapse = async (
  id: string,
  updates: Partial<RelapseInput>
): Promise<Relapse | null> => {
  const db = await getDatabase();

  // First, get the existing record
  const existing = await db.getFirstAsync<{
    id: string;
    timestamp: string;
    note: string | null;
    tags: string | null;
  }>('SELECT * FROM relapse WHERE id = ?', [id]);

  if (!existing) {
    return null;
  }

  // Prepare updated values
  const note = updates.note !== undefined ? updates.note : existing.note;
  const tags =
    updates.tags !== undefined
      ? JSON.stringify(updates.tags)
      : existing.tags;

  // Update the record
  await db.runAsync(
    'UPDATE relapse SET note = ?, tags = ? WHERE id = ?',
    [note, tags, id]
  );

  return {
    id: existing.id,
    timestamp: existing.timestamp,
    note: note || undefined,
    tags: tags ? JSON.parse(tags) : undefined,
  };
};

/**
 * Reset all database data (delete all relapses and clear journey start)
 */
export const resetDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM relapse');
  await db.runAsync('DELETE FROM activity');
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', ['journey_start']);
};

/**
 * Add a new activity record
 */
export const addActivity = async (input: ActivityInput): Promise<Activity> => {
  const db = await getDatabase();

  const id = generateUUID();
  const timestamp = input.timestamp || new Date().toISOString();

  // Validate inputs
  const timestampValidation = validateTimestamp(timestamp);
  if (timestampValidation !== true) {
    throw new Error(timestampValidation);
  }

  const noteValidation = validateNote(input.note);
  if (noteValidation !== true) {
    throw new Error(noteValidation);
  }

  const categoryValidation = validateCategory(input.categories);
  if (categoryValidation !== true) {
    throw new Error(categoryValidation);
  }

  // Sanitize inputs
  const note = sanitizeString(input.note, 5000) || null;
  const categories = input.categories ? JSON.stringify(input.categories) : null;

  await db.runAsync(
    'INSERT INTO activity (id, timestamp, note, category) VALUES (?, ?, ?, ?)',
    [id, timestamp, note, categories]
  );

  return {
    id,
    timestamp,
    note: note || undefined,
    categories: input.categories,
  };
};

/**
 * Get all activity records, ordered by timestamp (newest first)
 * @param limit - Optional limit for number of records to return (default: all)
 * @param offset - Optional offset for pagination (default: 0)
 */
export const getActivities = async (limit?: number, offset: number = 0): Promise<Activity[]> => {
  const db = await getDatabase();

  let query = 'SELECT * FROM activity ORDER BY timestamp DESC';
  const params: any[] = [];

  if (limit !== undefined) {
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const rows = await db.getAllAsync<{
    id: string;
    timestamp: string;
    note: string | null;
    category: string | null;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    note: row.note || undefined,
    categories: row.category ? JSON.parse(row.category) : undefined,
  }));
};

/**
 * Delete an activity record by ID
 */
export const deleteActivity = async (id: string): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM activity WHERE id = ?', [id]);
};

/**
 * Get total count of relapse records
 */
export const getRelapsesCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM relapse'
  );
  return result?.count || 0;
};

/**
 * Get total count of activity records
 */
export const getActivitiesCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM activity'
  );
  return result?.count || 0;
};

/**
 * Get a generic app setting value by key
 */
export const getAppSetting = async (key: string): Promise<string | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return result?.value || null;
};

/**
 * Set a generic app setting value by key
 */
export const setAppSetting = async (key: string, value: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};

/**
 * Delete an app setting by key
 */
export const deleteAppSetting = async (key: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', [key]);
};
