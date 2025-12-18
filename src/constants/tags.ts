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

/**
 * Check if a category is a built-in activity category
 */
export const isBuiltInCategory = (category: string): boolean => {
  return ACTIVITY_CATEGORIES.includes(category as ActivityCategory);
};

/**
 * Filter categories to only include valid ones (built-in + active custom tags)
 * @param categories - Array of category strings from an activity
 * @param customTags - Array of currently active custom tags (with id, emoji, label)
 * @returns Filtered array of valid categories
 */
export const filterValidCategories = (
  categories: string[],
  customTags: Array<{ id: string; emoji: string; label: string }>
): string[] => {
  // Build a set of valid custom tag display strings
  const validCustomTags = new Set(
    customTags.map(tag => `${tag.emoji} ${tag.label}`)
  );

  return categories.filter(
    cat => isBuiltInCategory(cat) || validCustomTags.has(cat)
  );
};
