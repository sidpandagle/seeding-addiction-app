import type { Relapse, Urge } from '../db/schema';

/**
 * Unified entry type for history display
 * Combines relapses and urge-resisted entries with a discriminator
 */
export type HistoryEntry =
  | { type: 'relapse'; data: Relapse }
  | { type: 'urge'; data: Urge };

/**
 * Helper to create a history entry from a relapse
 */
export const createRelapseEntry = (relapse: Relapse): HistoryEntry => ({
  type: 'relapse',
  data: relapse,
});

/**
 * Helper to create a history entry from an urge
 */
export const createUrgeEntry = (urge: Urge): HistoryEntry => ({
  type: 'urge',
  data: urge,
});

/**
 * Sort history entries by timestamp (newest first)
 */
export const sortHistoryEntries = (entries: HistoryEntry[]): HistoryEntry[] => {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.data.timestamp).getTime();
    const timeB = new Date(b.data.timestamp).getTime();
    return timeB - timeA; // Descending order (newest first)
  });
};

/**
 * Get timestamp from any history entry
 */
export const getEntryTimestamp = (entry: HistoryEntry): string => {
  return entry.data.timestamp;
};

/**
 * Get ID from any history entry
 */
export const getEntryId = (entry: HistoryEntry): string => {
  return entry.data.id;
};
