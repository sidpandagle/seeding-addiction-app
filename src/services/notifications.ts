/**
 * Notification Service
 * Handles local push notifications for achievements and motivational reminders
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { NOTIFICATION_CONFIG, getAchievementNotificationId } from '../constants/notificationConfig';
import {
  getAchievementNotificationTitle,
  getAchievementNotificationBody,
  getMotivationalNotificationQuote,
  formatMotivationalNotificationBody,
  parseNotificationTime,
  clearLastNotifiedAchievement,
} from '../utils/notificationHelpers';
import { Achievement, GROWTH_STAGES } from '../utils/growthStages';
import { daysToMilliseconds } from '../constants/timeUnits';

/**
 * Set notification handler for foreground notifications
 * This determines how notifications behave when the app is open
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: NOTIFICATION_CONFIG.PLAY_SOUND,
    shouldSetBadge: NOTIFICATION_CONFIG.AUTO_BADGE_COUNT,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * @returns true if permissions granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Check if running on a physical device
  if (!Device.isDevice) {
    console.warn('Notifications only work on physical devices, not simulators/emulators');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Set up Android notification channels
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notification permissions are already granted
 * @returns true if permissions granted, false otherwise
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Set up Android notification channels
 * Required for Android 8.0+ (API level 26+)
 */
async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Achievement channel (high priority)
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.id,
      {
        name: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.name,
        importance: Notifications.AndroidImportance.HIGH,
        description: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.description,
        sound: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.sound ? 'default' : undefined,
        vibrationPattern: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.vibrate
          ? [0, 250, 250, 250]
          : undefined,
        enableVibrate: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.vibrate,
        showBadge: NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.badge,
      }
    );

    // Motivational channel (default priority)
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.id,
      {
        name: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.name,
        importance: Notifications.AndroidImportance.DEFAULT,
        description: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.description,
        sound: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.sound ? 'default' : undefined,
        vibrationPattern: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.vibrate
          ? [0, 250, 250, 250]
          : undefined,
        enableVibrate: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.vibrate,
        showBadge: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.badge,
      }
    );
  } catch (error) {
    console.error('Error setting up Android notification channels:', error);
  }
}

/**
 * Schedule a notification for a specific achievement
 * @param achievement - Achievement to notify about
 * @param triggerTime - Timestamp when notification should fire
 */
export async function scheduleAchievementNotification(
  achievement: Achievement,
  triggerTime: Date
): Promise<void> {
  try {
    const notificationId = getAchievementNotificationId(achievement.id);

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: getAchievementNotificationTitle(achievement),
        body: getAchievementNotificationBody(achievement),
        sound: NOTIFICATION_CONFIG.PLAY_SOUND ? 'default' : undefined,
        badge: NOTIFICATION_CONFIG.AUTO_BADGE_COUNT ? 1 : undefined,
        data: {
          type: NOTIFICATION_CONFIG.ACHIEVEMENT_CATEGORY,
          achievementId: achievement.id,
        },
        categoryIdentifier: NOTIFICATION_CONFIG.ACHIEVEMENT_CATEGORY,
      },
      trigger: {
        type: 'date',
        date: triggerTime,
        channelId: Platform.OS === 'android'
          ? NOTIFICATION_CONFIG.CHANNELS.ACHIEVEMENT.id
          : undefined,
      } as Notifications.DateTriggerInput,
    });

    console.log(`✅ Scheduled achievement: ${achievement.id} at ${triggerTime.toLocaleString()}`);
  } catch (error) {
    console.error(`❌ Error scheduling achievement notification for ${achievement.id}:`, error);
  }
}

/**
 * Schedule notifications for all upcoming achievements
 * Uses ABSOLUTE time scheduling based on journey start timestamp
 * This ensures perfect synchronization with achievement unlocks regardless of app restarts
 * @param journeyStartTimestamp - Journey start timestamp (ISO string)
 */
export async function scheduleAllUpcomingMilestones(
  journeyStartTimestamp: string
): Promise<void> {
  try {
    // Cancel existing achievement notifications
    await cancelAchievementNotifications();

    const journeyStart = new Date(journeyStartTimestamp);
    const journeyStartTime = journeyStart.getTime();
    const now = Date.now();
    const currentElapsedTime = now - journeyStartTime;

    // Iterate through all growth stages and schedule notifications for future ones
    for (const stage of GROWTH_STAGES) {
      const threshold = daysToMilliseconds(stage.minDays);

      // Skip if already unlocked
      if (currentElapsedTime >= threshold) {
        continue;
      }

      // ✅ ABSOLUTE TIME CALCULATION
      // Calculate trigger time as: journey start + threshold
      // This ensures notifications fire exactly when elapsed time reaches threshold
      // No drift on app restart or settings change!
      const triggerTime = new Date(journeyStartTime + threshold);

      // Skip if the calculated trigger time is in the past
      // (edge case: shouldn't happen if filtering logic above is correct)
      if (triggerTime.getTime() <= now) {
        continue;
      }

      // Schedule the notification
      const achievement: Achievement = {
        id: stage.id,
        title: stage.achievementTitle,
        description: stage.achievementDescription,
        emoji: stage.emoji,
        threshold,
        shortLabel: stage.shortLabel,
        isUnlocked: false,
      };

      await scheduleAchievementNotification(achievement, triggerTime);
    }

    const scheduledCount = GROWTH_STAGES.filter(stage =>
      currentElapsedTime < daysToMilliseconds(stage.minDays)
    ).length;
    console.log(`✅ Scheduled ${scheduledCount} milestone notifications (absolute time from ${journeyStart.toLocaleString()})`);
  } catch (error) {
    console.error('❌ Error scheduling upcoming milestones:', error);
  }
}

/**
 * Cancel all achievement notifications
 */
export async function cancelAchievementNotifications(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (
        notification.identifier.startsWith(NOTIFICATION_CONFIG.ACHIEVEMENT_IDENTIFIER_PREFIX)
      ) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    console.log('All achievement notifications cancelled');
  } catch (error) {
    console.error('Error cancelling achievement notifications:', error);
  }
}

/**
 * Schedule the daily motivational notification
 * @param timeString - Time in "HH:MM" format (e.g., "09:00")
 */
export async function scheduleDailyMotivationalNotification(
  timeString: string
): Promise<void> {
  try {
    // Cancel existing motivational notification
    await cancelDailyMotivationalNotification();

    // Parse time
    const { hour, minute } = parseNotificationTime(timeString);

    // Get random quote
    const { quote, author } = await getMotivationalNotificationQuote();
    const body = formatMotivationalNotificationBody(quote, author);

    // Calculate the next occurrence of the specified time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule repeating daily notification
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_CONFIG.MOTIVATIONAL_IDENTIFIER,
      content: {
        title: NOTIFICATION_CONFIG.TEMPLATES.MOTIVATIONAL.title,
        body,
        sound: NOTIFICATION_CONFIG.PLAY_SOUND ? 'default' : undefined,
        badge: NOTIFICATION_CONFIG.AUTO_BADGE_COUNT ? 1 : undefined,
        data: {
          type: NOTIFICATION_CONFIG.MOTIVATIONAL_CATEGORY,
        },
        categoryIdentifier: NOTIFICATION_CONFIG.MOTIVATIONAL_CATEGORY,
      },
      trigger: Platform.OS === 'android'
        ? {
            // Android: Use daily trigger with seconds
            type: 'daily',
            hour,
            minute,
            repeats: true,
            channelId: NOTIFICATION_CONFIG.CHANNELS.MOTIVATIONAL.id,
          } as Notifications.DailyTriggerInput
        : {
            // iOS: Use calendar trigger
            type: 'calendar',
            hour,
            minute,
            repeats: true,
          } as Notifications.CalendarTriggerInput,
    });

    console.log(`✅ Daily motivational notification scheduled for ${timeString} (repeats daily)`);
  } catch (error) {
    console.error('❌ Error scheduling daily motivational notification:', error);
  }
}

/**
 * Cancel the daily motivational notification
 */
export async function cancelDailyMotivationalNotification(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      NOTIFICATION_CONFIG.MOTIVATIONAL_IDENTIFIER
    );
    console.log('Daily motivational notification cancelled');
  } catch (error) {
    console.error('Error cancelling daily motivational notification:', error);
  }
}

/**
 * Cancel all notifications (achievements and motivational)
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Enable notifications
 * Requests permissions and schedules notifications
 * @param journeyStartTimestamp - Journey start timestamp (or null if no journey yet)
 * @param motivationalTime - Time for daily motivational notification
 * @returns true if successfully enabled, false otherwise
 */
export async function enableNotifications(
  journeyStartTimestamp: string | null,
  motivationalTime: string
): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive milestone alerts and daily motivation.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Schedule motivational notification
    await scheduleDailyMotivationalNotification(motivationalTime);

    // Schedule achievement notifications if journey has started
    if (journeyStartTimestamp !== null) {
      await scheduleAllUpcomingMilestones(journeyStartTimestamp);
    }

    return true;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
}

/**
 * Disable notifications
 * Cancels all scheduled notifications
 */
export async function disableNotifications(): Promise<void> {
  try {
    await cancelAllNotifications();
    console.log('Notifications disabled');
  } catch (error) {
    console.error('Error disabling notifications:', error);
  }
}

/**
 * Initialize notifications on app start
 * Sets up channels and schedules notifications if enabled
 * @param notificationsEnabled - Whether notifications are enabled
 * @param journeyStartTimestamp - Journey start timestamp (or null if no journey yet)
 * @param motivationalTime - Time for daily motivational notification
 */
export async function initializeNotifications(
  notificationsEnabled: boolean,
  journeyStartTimestamp: string | null,
  motivationalTime: string
): Promise<void> {
  try {
    if (!notificationsEnabled) {
      console.log('Notifications disabled, skipping initialization');
      return;
    }

    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permissions, skipping initialization');
      return;
    }

    // Set up Android channels
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    // Schedule notifications
    await scheduleDailyMotivationalNotification(motivationalTime);

    if (journeyStartTimestamp !== null) {
      await scheduleAllUpcomingMilestones(journeyStartTimestamp);
    }

    console.log('Notifications initialized successfully');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * Handle journey reset (relapse)
 * Reschedules all achievement notifications from the beginning
 * @param newJourneyStartTimestamp - New journey start timestamp
 * @param notificationsEnabled - Whether notifications are enabled
 */
export async function handleJourneyReset(
  newJourneyStartTimestamp: string,
  notificationsEnabled: boolean
): Promise<void> {
  try {
    if (!notificationsEnabled) {
      return;
    }

    // Clear last notified achievement
    await clearLastNotifiedAchievement();

    // Reschedule all achievement notifications from scratch (absolute time from new start)
    await scheduleAllUpcomingMilestones(newJourneyStartTimestamp);

    console.log('Journey reset: notifications rescheduled');
  } catch (error) {
    console.error('Error handling journey reset:', error);
  }
}

/**
 * Get all currently scheduled notifications (for debugging)
 * @returns Array of scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Clear notification badge count
 */
export async function clearBadgeCount(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge count:', error);
  }
}
