/**
 * Date utility functions with proper timezone handling
 *
 * Key principles:
 * - All timestamps are stored in ISO8601 UTC format
 * - All date extraction uses local timezone
 * - All comparisons use local date strings (YYYY-MM-DD)
 */

/**
 * Extract local date string (YYYY-MM-DD) from ISO timestamp
 * Uses the device's local timezone, not UTC
 *
 * @param timestamp - ISO8601 timestamp string (UTC)
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // User in IST (UTC+5:30) at 12:30 AM local time on Nov 26
 * // Timestamp stored as: "2025-11-25T19:00:00.000Z"
 * getLocalDateString("2025-11-25T19:00:00.000Z")
 * // Returns: "2025-11-26" (correct local date)
 *
 * @example
 * // User in PST (UTC-8) at 11:30 PM local time on Nov 25
 * // Timestamp stored as: "2025-11-26T07:30:00.000Z"
 * getLocalDateString("2025-11-26T07:30:00.000Z")
 * // Returns: "2025-11-25" (correct local date)
 */
export function getLocalDateString(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 *
 * @returns Today's date string in YYYY-MM-DD format
 *
 * @example
 * // Returns today's date in user's local timezone
 * getTodayLocalDateString() // "2025-11-26"
 */
export function getTodayLocalDateString(): string {
  return getLocalDateString(new Date().toISOString());
}
