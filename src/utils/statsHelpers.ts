import type { Relapse, Activity } from '../db/schema';
import {
  computeStreaks,
  countDaysKept,
  averageStreakMs,
  longestStreakMs,
  toWholeDays,
} from './streaks';

export interface UserStats {
  currentStreak: number; // Days since last relapse
  bestStreak: number; // Longest streak ever achieved, in whole days
  bestStreakMs: number; // Same, exact (used to pick the stage emoji)
  averageStreak: number; // Average streak length in whole days
  averageStreakMs: number; // Same, exact
  daysKept: number; // Calendar days without a relapse, up to yesterday (never resets)
  totalAttempts: number; // Number of relapses (fresh starts)
  activitiesLogged: number; // Total number of positive activities logged
  resistanceRate: number; // Percentage of activities vs relapses (activities / (activities + relapses) * 100)
}

/**
 * Calculate user statistics from relapse data, activity data, and journey start
 * @param relapses - Array of all relapse records
 * @param journeyStart - ISO string of when the journey began (not the latest relapse)
 * @param activities - Array of all activity records
 * @returns UserStats with streak, never-reset and activity numbers
 */
export function calculateUserStats(
  relapses: Relapse[],
  journeyStart: string | null,
  activities: Activity[] = [],
  now: number = Date.now()
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
      bestStreakMs: 0,
      averageStreak: 0,
      averageStreakMs: 0,
      daysKept: 0,
      totalAttempts: 0,
      activitiesLogged: 0,
      resistanceRate: 0,
    };
  }

  const streaks = computeStreaks(relapses, journeyStart, now);
  const current = streaks[streaks.length - 1];
  const bestStreakMs = longestStreakMs(streaks);
  const avgMs = averageStreakMs(streaks);

  return {
    currentStreak: toWholeDays(current.durationMs),
    bestStreak: toWholeDays(bestStreakMs),
    bestStreakMs,
    // Whole days, like bestStreak, so the average never shows above the best
    averageStreak: toWholeDays(avgMs),
    averageStreakMs: avgMs,
    daysKept: countDaysKept(relapses, journeyStart, now),
    totalAttempts,
    activitiesLogged,
    resistanceRate,
  };
}
