/**
 * Streak calculations shared by Home stats, the Garden, the relapse flow and Achievements.
 * Pure functions with no React Native imports, so they run under `bun test`.
 */

import { MS_PER_DAY } from '../constants/timeUnits';
import { getLocalDateString } from './dateHelpers';

export interface Streak<R extends { timestamp: string } = { timestamp: string }> {
  /** When the streak began (journey start or the relapse before it), epoch ms */
  start: number;
  /** When it ended (the relapse that ended it, or `now` for the current one), epoch ms */
  end: number;
  durationMs: number;
  /** True only for the streak that is still running */
  isCurrent: boolean;
  /** The relapse that ended this streak (undefined for the current one) */
  endedBy?: R;
}

/**
 * Split the journey into streaks, oldest first. The last item is always the current streak.
 * Returns an empty array until the journey has started.
 */
export function computeStreaks<R extends { timestamp: string }>(
  relapses: R[],
  journeyStart: string | null,
  now: number = Date.now()
): Streak<R>[] {
  if (!journeyStart) return [];

  const sorted = [...relapses].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const streaks: Streak<R>[] = [];
  let start = new Date(journeyStart).getTime();

  for (const relapse of sorted) {
    const end = new Date(relapse.timestamp).getTime();
    streaks.push({ start, end, durationMs: Math.max(0, end - start), isCurrent: false, endedBy: relapse });
    // A relapse logged before the journey start can't move the start backwards
    start = Math.max(start, end);
  }

  streaks.push({ start, end: Math.max(start, now), durationMs: Math.max(0, now - start), isCurrent: true });
  return streaks;
}

/** Whole days in a duration (a 9 d 6 h streak counts as 9) */
export function toWholeDays(durationMs: number): number {
  return Math.floor(durationMs / MS_PER_DAY);
}

/** Longest streak in ms, including the current one */
export function longestStreakMs(streaks: Streak[]): number {
  return streaks.reduce((max, s) => Math.max(max, s.durationMs), 0);
}

/** Longest finished streak in ms (0 when there is none) */
export function longestPastStreakMs(streaks: Streak[]): number {
  return streaks.reduce((max, s) => (s.isCurrent ? max : Math.max(max, s.durationMs)), 0);
}

/** Average streak length in ms, including the current one */
export function averageStreakMs(streaks: Streak[]): number {
  if (streaks.length === 0) return 0;
  return streaks.reduce((sum, s) => sum + s.durationMs, 0) / streaks.length;
}

/**
 * "Days kept": calendar days from the journey start up to yesterday with no relapse logged.
 * Today is left out, so the number only ticks up at midnight and a relapse today never lowers it.
 */
export function countDaysKept(
  relapses: { timestamp: string }[],
  journeyStart: string | null,
  now: number = Date.now()
): number {
  if (!journeyStart) return 0;

  const relapseDays = new Set(relapses.map((r) => getLocalDateString(r.timestamp)));
  const cursor = new Date(journeyStart);
  cursor.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let kept = 0;
  while (cursor < today) {
    if (!relapseDays.has(getLocalDateString(cursor.toISOString()))) kept++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return kept;
}
