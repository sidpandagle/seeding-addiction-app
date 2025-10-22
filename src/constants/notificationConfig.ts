/**
 * Notification configuration constants
 * Defines categories, channels, and default settings for push notifications
 */

export const NOTIFICATION_CONFIG = {
  // Notification Categories
  ACHIEVEMENT_CATEGORY: 'achievement',
  MOTIVATIONAL_CATEGORY: 'motivational',

  // Identifiers
  ACHIEVEMENT_IDENTIFIER_PREFIX: 'notif-achievement-',
  MOTIVATIONAL_IDENTIFIER: 'notif-motivational-daily',

  // Defaults
  DEFAULT_MOTIVATIONAL_TIME: '10:30', // 10:30 AM local time

  // Privacy & Behavior
  SHOW_ON_LOCK_SCREEN: true,
  ALLOW_IN_QUIET_MODE: false, // Don't bypass Do Not Disturb
  PLAY_SOUND: true,
  AUTO_BADGE_COUNT: true,

  // Android Notification Channels
  CHANNELS: {
    ACHIEVEMENT: {
      id: 'achievements',
      name: 'Milestone Achievements',
      importance: 4, // AndroidImportance.HIGH
      description: 'Notifications when you reach growth milestones',
      sound: true,
      vibrate: true,
      badge: true,
    },
    MOTIVATIONAL: {
      id: 'motivational',
      name: 'Daily Motivation',
      importance: 3, // AndroidImportance.DEFAULT
      description: 'Daily reminders with stoic wisdom',
      sound: true,
      vibrate: true,
      badge: true,
    },
  },

  // Notification Content Templates
  TEMPLATES: {
    ACHIEVEMENT: {
      titlePrefix: '',
      titleSuffix: '',
      bodyPrefix: '',
      bodySuffix: '\n\nTap to view your progress.',
    },
    MOTIVATIONAL: {
      title: 'Stoic Wisdom for Your Journey',
      bodyPrefix: '',
      bodySuffix: '',
    },
  },

  // Quote filtering for notifications (max length in characters)
  MAX_QUOTE_LENGTH: 100,

  // Quote cache duration (days)
  QUOTE_CACHE_DURATION_DAYS: 7,

  // Storage keys
  STORAGE_KEYS: {
    RECENT_QUOTES: 'notification_recent_quotes',
    LAST_ACHIEVEMENT_NOTIFIED: 'notification_last_achievement',
  },
} as const;

/**
 * Helper to get achievement notification identifier
 * @param achievementId - Achievement ID (e.g., "sprout", "seedling")
 * @returns Notification identifier string
 */
export function getAchievementNotificationId(achievementId: string): string {
  return `${NOTIFICATION_CONFIG.ACHIEVEMENT_IDENTIFIER_PREFIX}${achievementId}`;
}

/**
 * Helper to extract achievement ID from notification identifier
 * @param notificationId - Notification identifier
 * @returns Achievement ID or null if not an achievement notification
 */
export function extractAchievementId(notificationId: string): string | null {
  if (notificationId.startsWith(NOTIFICATION_CONFIG.ACHIEVEMENT_IDENTIFIER_PREFIX)) {
    return notificationId.substring(NOTIFICATION_CONFIG.ACHIEVEMENT_IDENTIFIER_PREFIX.length);
  }
  return null;
}
