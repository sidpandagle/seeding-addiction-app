/**
 * Tag and context constants for relapse and urge tracking
 * Single source of truth for all tag/context options across the app
 */

/**
 * Standard tags for relapse events
 * Used in: RelapseModal, HistoryList
 */
export const RELAPSE_TAGS = [
  'Stress',
  'Trigger',
  'Social',
  'Boredom',
  'Craving',
  'Other',
] as const;

/**
 * Context options for urge events
 * Used in: UrgeModal
 */
export const URGE_CONTEXTS = [
  'Stress',
  'Boredom',
  'Trigger',
  'Social',
  'Tired',
  'Anxious',
  'Other',
] as const;

// Type exports for type safety
export type RelapseTag = typeof RELAPSE_TAGS[number];
export type UrgeContext = typeof URGE_CONTEXTS[number];
