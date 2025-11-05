import type { Relapse, Activity } from '../db/schema';
import { MS_PER_DAY } from '../constants/timeUnits';

export interface UserStats {
  currentStreak: number; // Days since last relapse
  bestStreak: number; // Longest streak ever achieved
  totalAttempts: number; // Number of relapses (fresh starts)
  activitiesLogged: number; // Total number of positive activities logged
  resistanceRate: number; // Percentage of activities vs relapses (activities / (activities + relapses) * 100)
}

/**
 * Calculate user statistics from relapse data, activity data, and journey start
 * @param relapses - Array of all relapse records
 * @param activities - Array of all activity records
 * @param journeyStart - ISO string of when the journey began
 * @returns UserStats object with current streak, best streak, total attempts, activities logged, and engagement rate
 */
export function calculateUserStats(
  relapses: Relapse[],
  journeyStart: string | null,
  activities: Activity[] = []
): UserStats {
  const totalAttempts = relapses.length;
  const activitiesLogged = activities.length;

  // Calculate engagement rate: activities / (activities + relapses) * 100
  const totalEvents = activitiesLogged + totalAttempts;
  const resistanceRate = totalEvents > 0 ? Math.round((activitiesLogged / totalEvents) * 100) : 0;

  // If no journey start, return zeros
  if (!journeyStart) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalAttempts: 0,
      activitiesLogged: 0,
      resistanceRate: 0,
    };
  }

  // Sort relapses by timestamp (oldest first for streak calculation)
  const sortedRelapses = [...relapses].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(sortedRelapses, journeyStart);

  // Calculate best streak
  const bestStreak = calculateBestStreak(sortedRelapses, journeyStart);

  return {
    currentStreak,
    bestStreak,
    totalAttempts,
    activitiesLogged,
    resistanceRate,
  };
}

/**
 * Calculate the current streak (days since last relapse or journey start)
 */
function calculateCurrentStreak(sortedRelapses: Relapse[], journeyStart: string): number {
  const now = Date.now();

  if (sortedRelapses.length === 0) {
    // No relapses - calculate from journey start
    const timeDiff = now - new Date(journeyStart).getTime();
    return Math.floor(timeDiff / MS_PER_DAY);
  }

  // Has relapses - calculate from last relapse
  const lastRelapse = sortedRelapses[sortedRelapses.length - 1];
  const timeDiff = now - new Date(lastRelapse.timestamp).getTime();
  return Math.floor(timeDiff / MS_PER_DAY);
}

/**
 * Calculate the best (longest) streak ever achieved
 */
function calculateBestStreak(sortedRelapses: Relapse[], journeyStart: string): number {
  if (sortedRelapses.length === 0) {
    // No relapses - current streak is also the best streak
    return calculateCurrentStreak(sortedRelapses, journeyStart);
  }

  const streaks: number[] = [];
  const journeyStartTime = new Date(journeyStart).getTime();

  // Calculate streak from journey start to first relapse
  const firstRelapseTime = new Date(sortedRelapses[0].timestamp).getTime();
  const firstStreak = Math.floor((firstRelapseTime - journeyStartTime) / MS_PER_DAY);
  streaks.push(firstStreak);

  // Calculate streaks between consecutive relapses
  for (let i = 0; i < sortedRelapses.length - 1; i++) {
    const currentRelapseTime = new Date(sortedRelapses[i].timestamp).getTime();
    const nextRelapseTime = new Date(sortedRelapses[i + 1].timestamp).getTime();
    const streak = Math.floor((nextRelapseTime - currentRelapseTime) / MS_PER_DAY);
    streaks.push(streak);
  }

  // Calculate current streak (from last relapse to now)
  const currentStreak = calculateCurrentStreak(sortedRelapses, journeyStart);
  streaks.push(currentStreak);

  // Return the maximum streak
  return Math.max(...streaks);
}

/**
 * Format a number of days into a human-readable string
 * @param days - Number of days
 * @returns Formatted string (e.g., "15 days", "1 day")
 */
export function formatDays(days: number): string {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';
  return `${days} days`;
}
