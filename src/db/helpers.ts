import { getDatabase } from './schema';
import type { Relapse, RelapseInput } from './schema';

/**
 * Generate a UUID v4
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get the journey start timestamp
 */
export const getJourneyStart = async (): Promise<string | null> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ value: string }>(
    // 'SELECT value FROM app_settings WHERE key = ?',
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
  const note = input.note || null;
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
 */
export const getRelapses = async (): Promise<Relapse[]> => {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    id: string;
    timestamp: string;
    note: string | null;
    tags: string | null;
  }>('SELECT * FROM relapse ORDER BY timestamp DESC');

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
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', ['journey_start']);
};
