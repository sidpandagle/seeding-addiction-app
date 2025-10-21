/**
 * Time conversion constants
 * Single source of truth for all time unit conversions across the app
 */

// Base time units in milliseconds
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;

// Convenience constants for common durations
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;

/**
 * Convert milliseconds to days
 */
export function millisecondsToDays(ms: number): number {
  return ms / MS_PER_DAY;
}

/**
 * Convert days to milliseconds
 */
export function daysToMilliseconds(days: number): number {
  return days * MS_PER_DAY;
}

/**
 * Convert milliseconds to hours
 */
export function millisecondsToHours(ms: number): number {
  return ms / MS_PER_HOUR;
}

/**
 * Convert hours to milliseconds
 */
export function hoursToMilliseconds(hours: number): number {
  return hours * MS_PER_HOUR;
}
