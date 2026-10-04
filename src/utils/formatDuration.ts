/**
 * Duration formatting for streaks, countdowns and notifications.
 * Pure functions, safe to use from services and tests.
 */

import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from '../constants/timeUnits';

/** Compact length of a streak: "31d", "5h", "12m" */
export function formatStreakLength(ms: number): string {
  if (ms >= MS_PER_DAY) return `${Math.floor(ms / MS_PER_DAY)}d`;
  if (ms >= MS_PER_HOUR) return `${Math.floor(ms / MS_PER_HOUR)}h`;
  return `${Math.max(0, Math.floor(ms / MS_PER_MINUTE))}m`;
}

/** Streak length as an adjective: "9-day", "5-hour", "12-minute" */
export function formatStreakAdjective(ms: number): string {
  if (ms >= MS_PER_DAY) return `${Math.floor(ms / MS_PER_DAY)}-day`;
  if (ms >= MS_PER_HOUR) return `${Math.floor(ms / MS_PER_HOUR)}-hour`;
  return `${Math.max(1, Math.floor(ms / MS_PER_MINUTE))}-minute`;
}

/** Time left until something, two units at most: "4d 17h", "3h 20m", "12m" */
export function formatTimeLeft(ms: number): string {
  const safe = Math.max(0, ms);
  const days = Math.floor(safe / MS_PER_DAY);
  const hours = Math.floor((safe % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((safe % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${Math.max(1, minutes)}m`;
}

/** Time left in words, one unit, for notification copy: "5 days", "18 hours", "45 minutes" */
export function formatTimeLeftLong(ms: number): string {
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (ms >= MS_PER_DAY) return plural(Math.round(ms / MS_PER_DAY), 'day');
  if (ms >= MS_PER_HOUR) return plural(Math.round(ms / MS_PER_HOUR), 'hour');
  return plural(Math.max(1, Math.round(ms / MS_PER_MINUTE)), 'minute');
}
