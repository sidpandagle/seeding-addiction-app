/**
 * Time conversion constants
 * Single source of truth for all time unit conversions across the app
 */

// Base time units in milliseconds
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;

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
