import { Achievement } from '../components/AchievementBadge';

/**
 * Achievement definitions for milestone celebrations
 * Aligned with growth stages and checkpoints
 */

export const ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_5min',
    title: 'First Steps',
    description: 'Started your journey - 5 minutes strong',
    emoji: '🌱',
    threshold: 5 * 60 * 1000, // 5 minutes
  },
  {
    id: 'first_hour',
    title: 'One Hour Warrior',
    description: 'Conquered your first hour',
    emoji: '⏰',
    threshold: 1 * 60 * 60 * 1000, // 1 hour
  },
  {
    id: 'first_day',
    title: 'Daily Champion',
    description: 'Made it through a full day',
    emoji: '🌅',
    threshold: 1 * 24 * 60 * 60 * 1000, // 1 day
  },
  {
    id: 'three_days',
    title: 'Three Day Hero',
    description: 'Three days of unwavering strength',
    emoji: '🔥',
    threshold: 3 * 24 * 60 * 60 * 1000, // 3 days
  },
  {
    id: 'one_week',
    title: 'Weekly Victor',
    description: 'Survived a full week - incredible!',
    emoji: '🏅',
    threshold: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
  {
    id: 'two_weeks',
    title: 'Fortnight Fighter',
    description: 'Two weeks of pure determination',
    emoji: '💪',
    threshold: 14 * 24 * 60 * 60 * 1000, // 2 weeks
  },
  {
    id: 'three_weeks',
    title: 'Legendary Streak',
    description: 'Three weeks - you are unstoppable',
    emoji: '⭐',
    threshold: 21 * 24 * 60 * 60 * 1000, // 3 weeks
  },
  {
    id: 'one_month',
    title: 'Monthly Master',
    description: 'A full month of growth and strength',
    emoji: '🎯',
    threshold: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  {
    id: 'two_months',
    title: 'Two Month Titan',
    description: 'Sixty days of unbreakable will',
    emoji: '🛡️',
    threshold: 60 * 24 * 60 * 60 * 1000, // 60 days
  },
  {
    id: 'three_months',
    title: 'Quarterly King',
    description: 'Three months - transformation complete',
    emoji: '👑',
    threshold: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
  {
    id: 'six_months',
    title: 'Half Year Hero',
    description: 'Six months of incredible resilience',
    emoji: '🦸',
    threshold: 180 * 24 * 60 * 60 * 1000, // 180 days
  },
  {
    id: 'one_year',
    title: 'Annual Legend',
    description: 'One full year - you are extraordinary',
    emoji: '🏆',
    threshold: 365 * 24 * 60 * 60 * 1000, // 365 days
  },
];

// ============================================================================
// Memoization Cache (Phase 2 Optimization)
// ============================================================================
// Cache prevents recreating 12 achievement objects on every render
// Cache key: elapsedTime rounded to nearest minute (60000ms)
// This reduces object creation by 60x without affecting accuracy

interface AchievementCache {
  key: number;
  result: Achievement[];
}

let achievementCache: AchievementCache | null = null;

/**
 * Get achievements based on elapsed time (memoized)
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Array of achievements with unlock status
 *
 * Performance: Caches result for 1 minute intervals
 * - Before: 12 new objects created every second (3600/min)
 * - After: 12 new objects created every minute (60/min)
 * - Reduction: 98.3% fewer object allocations
 */
export function getAchievements(elapsedTime: number): Achievement[] {
  // Round to nearest minute for cache key (reduces cache misses)
  const cacheKey = Math.floor(elapsedTime / 60000);

  // Return cached result if available
  if (achievementCache && achievementCache.key === cacheKey) {
    return achievementCache.result;
  }

  // Calculate new result
  const result = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    isUnlocked: elapsedTime >= achievement.threshold,
    unlockedAt: elapsedTime >= achievement.threshold
      ? new Date(Date.now() - (elapsedTime - achievement.threshold)).toISOString()
      : undefined,
  }));

  // Update cache
  achievementCache = { key: cacheKey, result };

  return result;
}

/**
 * Get newly unlocked achievements since last check
 * @param currentTime - Current elapsed time in milliseconds
 * @param previousTime - Previous elapsed time in milliseconds
 * @returns Array of newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(
  currentTime: number,
  previousTime: number
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      currentTime >= achievement.threshold && previousTime < achievement.threshold
  ).map((achievement) => ({
    ...achievement,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
  }));
}

/**
 * Get the next achievement to unlock
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Next achievement or null if all unlocked
 */
export function getNextAchievement(elapsedTime: number): Achievement | null {
  const next = ACHIEVEMENTS.find((achievement) => elapsedTime < achievement.threshold);
  return next
    ? {
        ...next,
        isUnlocked: false,
      }
    : null;
}
