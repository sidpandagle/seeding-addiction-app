import type { Relapse, Urge } from '../db/schema';

export interface UserStats {
  currentStreak: number; // Days since last relapse
  bestStreak: number; // Longest streak ever achieved
  totalAttempts: number; // Number of relapses (fresh starts)
  urgesResisted: number; // Total number of urges successfully resisted
  resistanceRate: number; // Percentage of urges resisted (urges / (urges + relapses) * 100)
}

/**
 * Calculate user statistics from relapse data, urge data, and journey start
 * @param relapses - Array of all relapse records
 * @param urges - Array of all urge records
 * @param journeyStart - ISO string of when the journey began
 * @returns UserStats object with current streak, best streak, total attempts, urges resisted, and resistance rate
 */
export function calculateUserStats(
  relapses: Relapse[],
  journeyStart: string | null,
  urges: Urge[] = []
): UserStats {
  const totalAttempts = relapses.length;
  const urgesResisted = urges.length;

  // Calculate resistance rate: urges / (urges + relapses) * 100
  const totalEvents = urgesResisted + totalAttempts;
  const resistanceRate = totalEvents > 0 ? Math.round((urgesResisted / totalEvents) * 100) : 0;

  // If no journey start, return zeros
  if (!journeyStart) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalAttempts: 0,
      urgesResisted: 0,
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
    urgesResisted,
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
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  // Has relapses - calculate from last relapse
  const lastRelapse = sortedRelapses[sortedRelapses.length - 1];
  const timeDiff = now - new Date(lastRelapse.timestamp).getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
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
  const firstStreak = Math.floor((firstRelapseTime - journeyStartTime) / (1000 * 60 * 60 * 24));
  streaks.push(firstStreak);

  // Calculate streaks between consecutive relapses
  for (let i = 0; i < sortedRelapses.length - 1; i++) {
    const currentRelapseTime = new Date(sortedRelapses[i].timestamp).getTime();
    const nextRelapseTime = new Date(sortedRelapses[i + 1].timestamp).getTime();
    const streak = Math.floor((nextRelapseTime - currentRelapseTime) / (1000 * 60 * 60 * 24));
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
