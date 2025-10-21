/**
 * Notification helper utilities
 * Functions for generating notification content and managing notification data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { stoicTeachings, StoicTeaching } from '../data/stoicTeachings';
import { Achievement } from './growthStages';
import { NOTIFICATION_CONFIG } from '../constants/notificationConfig';

/**
 * Get notification body text for an achievement
 * @param achievement - Achievement object
 * @returns Formatted notification body string
 */
export function getAchievementNotificationBody(achievement: Achievement): string {
  const body = achievement.description;
  return `${body}${NOTIFICATION_CONFIG.TEMPLATES.ACHIEVEMENT.bodySuffix}`;
}

/**
 * Get notification title for an achievement
 * @param achievement - Achievement object
 * @returns Formatted notification title string
 */
export function getAchievementNotificationTitle(achievement: Achievement): string {
  return `${achievement.emoji} ${achievement.title}`;
}

/**
 * Filter stoic quotes suitable for notifications (by length)
 * @returns Array of quotes under the max length
 */
function getNotificationSuitableQuotes(): StoicTeaching[] {
  return stoicTeachings.filter(
    (teaching) => teaching.quote.length <= NOTIFICATION_CONFIG.MAX_QUOTE_LENGTH
  );
}

/**
 * Get recently shown quote IDs from cache
 * @returns Array of recently shown quote IDs
 */
async function getRecentQuoteIds(): Promise<string[]> {
  try {
    const cached = await AsyncStorage.getItem(NOTIFICATION_CONFIG.STORAGE_KEYS.RECENT_QUOTES);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (within QUOTE_CACHE_DURATION_DAYS)
      const now = Date.now();
      const cacheAge = now - (parsed.timestamp || 0);
      const maxAge = NOTIFICATION_CONFIG.QUOTE_CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;

      if (cacheAge < maxAge) {
        return parsed.ids || [];
      }
    }
  } catch (error) {
    console.error('Error reading recent quotes cache:', error);
  }
  return [];
}

/**
 * Save recently shown quote IDs to cache
 * @param ids - Array of quote IDs to cache
 */
async function saveRecentQuoteIds(ids: string[]): Promise<void> {
  try {
    const data = {
      ids,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      NOTIFICATION_CONFIG.STORAGE_KEYS.RECENT_QUOTES,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error('Error saving recent quotes cache:', error);
  }
}

/**
 * Get a random motivational quote for notification
 * Avoids repeating quotes shown in the last QUOTE_CACHE_DURATION_DAYS days
 * @returns Object with quote and author
 */
export async function getMotivationalNotificationQuote(): Promise<{
  quote: string;
  author: string;
}> {
  const suitableQuotes = getNotificationSuitableQuotes();
  const recentIds = await getRecentQuoteIds();

  // Filter out recently shown quotes
  let availableQuotes = suitableQuotes.filter(
    (teaching) => !recentIds.includes(teaching.id)
  );

  // If all quotes have been shown, reset and use all quotes
  if (availableQuotes.length === 0) {
    availableQuotes = suitableQuotes;
    await saveRecentQuoteIds([]); // Clear cache
  }

  // Select random quote from available pool
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];

  // Update cache with newly shown quote
  const updatedRecentIds = [...recentIds, selectedQuote.id];
  await saveRecentQuoteIds(updatedRecentIds);

  return {
    quote: selectedQuote.quote,
    author: selectedQuote.author,
  };
}

/**
 * Format motivational notification body
 * @param quote - Quote text
 * @param author - Author name
 * @returns Formatted notification body
 */
export function formatMotivationalNotificationBody(
  quote: string,
  author: string
): string {
  return `"${quote}"\n\n— ${author}`;
}

/**
 * Calculate time until a specific achievement is unlocked
 * @param currentElapsedTime - Current journey elapsed time in milliseconds
 * @param achievement - Target achievement
 * @returns Time in milliseconds until achievement, or 0 if already unlocked
 */
export function getTimeUntilAchievement(
  currentElapsedTime: number,
  achievement: Achievement
): number {
  if (currentElapsedTime >= achievement.threshold) {
    return 0; // Already unlocked
  }
  return achievement.threshold - currentElapsedTime;
}

/**
 * Get the last achievement that was notified
 * @returns Achievement ID or null
 */
export async function getLastNotifiedAchievement(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(
      NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_ACHIEVEMENT_NOTIFIED
    );
    return value;
  } catch (error) {
    console.error('Error reading last notified achievement:', error);
    return null;
  }
}

/**
 * Save the last achievement that was notified
 * @param achievementId - Achievement ID
 */
export async function saveLastNotifiedAchievement(
  achievementId: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_ACHIEVEMENT_NOTIFIED,
      achievementId
    );
  } catch (error) {
    console.error('Error saving last notified achievement:', error);
  }
}

/**
 * Clear the last notified achievement (e.g., after relapse/reset)
 */
export async function clearLastNotifiedAchievement(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_ACHIEVEMENT_NOTIFIED
    );
  } catch (error) {
    console.error('Error clearing last notified achievement:', error);
  }
}

/**
 * Parse notification time string to hours and minutes
 * @param timeString - Time in format "HH:MM" (e.g., "09:00")
 * @returns Object with hour and minute
 */
export function parseNotificationTime(timeString: string): {
  hour: number;
  minute: number;
} {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10) || 9,
    minute: parseInt(minuteStr, 10) || 0,
  };
}
