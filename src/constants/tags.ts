/**
 * Tag and category constants for relapse and activity tracking
 * Single source of truth for all tag/category options across the app
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
 * Category options for positive activities
 * Used in: ActivityModal, HistoryList
 */
export const ACTIVITY_CATEGORIES = [
  '🏃 Physical',
  '👥 Social',
  '🎨 Creative',
  '📚 Learning',
  '🧘 Mindfulness',
  '🎯 Productive',
  '🌳 Nature',
  '💤 Rest/Sleep',
  '🍎 Healthy Eating',
  '🧹 Organizing',
  '🎮 Hobbies',
  '💼 Work/Career',
  '🙏 Spiritual',
  '📖 Reading',
  '🎵 Music',
  '✨ Other',
] as const;

// Type exports for type safety
export type RelapseTag = typeof RELAPSE_TAGS[number];
export type ActivityCategory = typeof ACTIVITY_CATEGORIES[number];
