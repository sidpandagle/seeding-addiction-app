import { getDatabase } from './schema';
import type { Relapse, RelapseInput, Urge, UrgeInput } from './schema';
import * as Crypto from 'expo-crypto';
import { 
  validateTimestamp, 
  sanitizeString, 
  validateTags, 
  validateNote,
  validateContext 
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
  await db.runAsync('DELETE FROM urge');
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', ['journey_start']);
};

/**
 * Add a new urge record
 */
export const addUrge = async (input: UrgeInput): Promise<Urge> => {
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
  
  const contextValidation = validateContext(input.context);
  if (contextValidation !== true) {
    throw new Error(contextValidation);
  }
  
  // Sanitize inputs
  const note = sanitizeString(input.note, 5000) || null;
  const context = sanitizeString(input.context, 100) || null;

  await db.runAsync(
    'INSERT INTO urge (id, timestamp, note, context) VALUES (?, ?, ?, ?)',
    [id, timestamp, note, context]
  );

  return {
    id,
    timestamp,
    note: note || undefined,
    context: context || undefined,
  };
};

/**
 * Get all urge records, ordered by timestamp (newest first)
 * @param limit - Optional limit for number of records to return (default: all)
 * @param offset - Optional offset for pagination (default: 0)
 */
export const getUrges = async (limit?: number, offset: number = 0): Promise<Urge[]> => {
  const db = await getDatabase();

  let query = 'SELECT * FROM urge ORDER BY timestamp DESC';
  const params: any[] = [];

  if (limit !== undefined) {
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const rows = await db.getAllAsync<{
    id: string;
    timestamp: string;
    note: string | null;
    context: string | null;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    note: row.note || undefined,
    context: row.context || undefined,
  }));
};

/**
 * Delete an urge record by ID
 */
export const deleteUrge = async (id: string): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM urge WHERE id = ?', [id]);
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
 * Get total count of urge records
 */
export const getUrgesCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM urge'
  );
  return result?.count || 0;
};
