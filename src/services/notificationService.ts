import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getAppSetting, setAppSetting } from '../db/helpers';
import { GROWTH_STAGES } from '../utils/growthStages';

// Notification settings keys
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const DAILY_REMINDER_TIME_KEY = 'daily_reminder_time';
const RANDOM_NOTIFICATIONS_KEY = 'random_notifications_enabled';
const MILESTONE_NOTIFICATIONS_KEY = 'milestone_notifications_enabled';

// Milestone notification thresholds
const ONE_HOUR_MS = 60 * 60 * 1000;
const ALMOST_THERE_PROGRESS_THRESHOLD = 0.75; // 75% progress triggers "Almost There"
const SHORT_MILESTONE_THRESHOLD_MS = ONE_HOUR_MS; // Milestones under this skip "Almost There"

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Motivational messages for random notifications
export const MOTIVATIONAL_MESSAGES = [
  { title: '🌱 Growing Strong!', body: 'Every moment of resistance makes your roots grow deeper.' },
  { title: '💪 You\'ve Got This!', body: 'One step at a time. One moment at a time. You\'re doing great!' },
  { title: '🌿 Stay Rooted', body: 'Remember why you started. Your future self will thank you.' },
  { title: '✨ Progress Over Perfection', body: 'It\'s not about being perfect, it\'s about growing stronger.' },
  { title: '🌳 Building Strength', body: 'Like a tree, you grow stronger through the storms.' },
  { title: '🌸 Bloom Where You\'re Planted', body: 'Every day is a chance to grow a little more.' },
  { title: '💚 Self-Care Reminder', body: 'Take a deep breath. You\'re doing better than you think.' },
  { title: '🔥 Keep The Fire', body: 'Your determination is your superpower. Keep going!' },
  { title: '🌈 After The Storm', body: 'Difficult times build resilient people. You\'re becoming stronger.' },
  { title: '🎯 Stay Focused', body: 'Eyes on the goal. You\'re closer than yesterday.' },
  { title: '🙏 Be Kind To Yourself', body: 'Recovery is a journey, not a destination. Be patient with yourself.' },
  { title: '⭐ You Matter', body: 'Your journey inspires others. Keep shining!' },
  { title: '🌻 Choose Growth', body: 'Every choice to resist is a choice to grow. Well done!' },
  { title: '💎 Diamond In The Making', body: 'Pressure creates diamonds. You\'re becoming stronger.' },
  { title: '🦋 Transformation', body: 'Change takes time. Trust the process, beautiful soul.' },
];

class NotificationService {
  private initialized = false;

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('[Notifications] Physical device required for notifications');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10b981',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
        });

        await Notifications.setNotificationChannelAsync('milestones', {
          name: 'Milestone Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#f59e0b',
        });

        await Notifications.setNotificationChannelAsync('motivation', {
          name: 'Motivational Messages',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#a855f7',
        });
      }

      this.initialized = true;
      console.log('[Notifications] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Notifications] Initialization error:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const setting = await getAppSetting(NOTIFICATIONS_ENABLED_KEY);
    return setting === 'true';
  }

  /**
   * Enable or disable notifications
   */
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await setAppSetting(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');

    if (!enabled) {
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  /**
   * Get daily reminder settings
   */
  async getDailyReminderTime(): Promise<{ hour: number; minute: number } | null> {
    const setting = await getAppSetting(DAILY_REMINDER_TIME_KEY);
    if (setting) {
      try {
        return JSON.parse(setting);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Set daily reminder time
   */
  async setDailyReminderTime(hour: number, minute: number): Promise<void> {
    await setAppSetting(DAILY_REMINDER_TIME_KEY, JSON.stringify({ hour, minute }));
    await this.scheduleDailyReminder(hour, minute);
  }

  /**
   * Clear daily reminder
   */
  async clearDailyReminder(): Promise<void> {
    await setAppSetting(DAILY_REMINDER_TIME_KEY, '');
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');
  }

  /**
   * Schedule daily check-in reminder
   */
  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    // Cancel existing daily reminder
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reminder',
      content: {
        title: '🌱 Daily Check-In',
        body: 'How are you doing today? Take a moment to water your plant!',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`[Notifications] Daily reminder scheduled for ${hour}:${minute}`);
  }

  /**
   * Check if random notifications are enabled
   */
  async areRandomNotificationsEnabled(): Promise<boolean> {
    const setting = await getAppSetting(RANDOM_NOTIFICATIONS_KEY);
    return setting === 'true';
  }

  /**
   * Enable or disable random notifications
   */
  async setRandomNotificationsEnabled(enabled: boolean): Promise<void> {
    await setAppSetting(RANDOM_NOTIFICATIONS_KEY, enabled ? 'true' : 'false');

    if (enabled) {
      await this.scheduleRandomNotifications();
    } else {
      // Cancel random notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.identifier.startsWith('random-')) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    }
  }

  /**
   * Schedule random motivational notifications throughout the day
   * Uses fixed times to prevent duplicate/inconsistent scheduling
   */
  async scheduleRandomNotifications(): Promise<void> {
    // Cancel existing random notifications first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const randomNotifications = scheduled.filter(n => n.identifier.startsWith('random-'));

    for (const notif of randomNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // Use fixed times to prevent scheduling inconsistencies
    // Morning, afternoon, and evening motivational messages
    const times = [
      { hour: 10, minute: 30 },  // 10:30 AM
      { hour: 15, minute: 0 },   // 3:00 PM
      { hour: 20, minute: 30 },  // 8:30 PM
    ];

    // Use deterministic message selection based on index
    // This ensures consistent notifications each day
    for (let i = 0; i < times.length; i++) {
      // Rotate through messages daily using day of week
      const dayOffset = new Date().getDay();
      const messageIndex = (i + dayOffset) % MOTIVATIONAL_MESSAGES.length;
      const message = MOTIVATIONAL_MESSAGES[messageIndex];

      await Notifications.scheduleNotificationAsync({
        identifier: `random-${i}`,
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          ...(Platform.OS === 'android' && { channelId: 'motivation' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: times[i].hour,
          minute: times[i].minute,
        },
      });
    }

    console.log('[Notifications] Random notifications scheduled at fixed times');
  }

  /**
   * Check if milestone notifications are enabled
   */
  async areMilestoneNotificationsEnabled(): Promise<boolean> {
    const setting = await getAppSetting(MILESTONE_NOTIFICATIONS_KEY);
    return setting !== 'false'; // Default to true
  }

  /**
   * Enable or disable milestone notifications
   */
  async setMilestoneNotificationsEnabled(enabled: boolean): Promise<void> {
    await setAppSetting(MILESTONE_NOTIFICATIONS_KEY, enabled ? 'true' : 'false');

    if (!enabled) {
      // Cancel all milestone notifications when disabled
      await this.cancelMilestoneNotifications();
    }
  }

  /**
   * Cancel all scheduled milestone notifications (both "Almost There" and "Achieved")
   */
  async cancelMilestoneNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    let cancelledCount = 0;

    for (const notif of scheduled) {
      // Cancel both milestone-almost-* and milestone-achieved-* notifications
      if (notif.identifier.startsWith('milestone-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        cancelledCount++;
      }
    }

    console.log(`[Notifications] Milestone notifications cancelled (${cancelledCount} total)`);
  }

  /**
   * Schedule notification for when a milestone is achieved (exact time)
   * @param stageIndex - Index of the milestone stage
   * @param targetDate - Exact time when milestone is reached
   */
  async scheduleMilestoneAchievedNotification(
    stageIndex: number,
    targetDate: Date
  ): Promise<void> {
    if (stageIndex >= GROWTH_STAGES.length) return;

    const stage = GROWTH_STAGES[stageIndex];
    const now = new Date();

    // Don't schedule if already past
    if (targetDate <= now) return;

    // Don't schedule if more than 7 days away
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (targetDate > sevenDaysFromNow) return;

    const identifier = `milestone-achieved-${stageIndex}`;

    // Cancel existing notification for this milestone
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${stage.emoji} ${stage.achievementTitle}!`,
        body: `Congratulations! You've reached "${stage.label}"! Keep growing stronger!`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'milestones' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      },
    });

    console.log(`[Notifications] Milestone ACHIEVED notification scheduled for stage ${stageIndex} (${stage.label}) at ${targetDate.toISOString()}`);
  }

  /**
   * Schedule "Almost There" notification at 75% progress toward a milestone
   * Skips short milestones (under 1 hour) - they only get "Achieved" notifications
   * @param stageIndex - Index of the milestone stage
   * @param milestoneDurationMs - Total duration of this milestone segment
   * @param milestoneStartTime - When the user started working toward this milestone
   */
  async scheduleAlmostThereNotification(
    stageIndex: number,
    milestoneDurationMs: number,
    milestoneStartTime: number
  ): Promise<void> {
    if (stageIndex >= GROWTH_STAGES.length) return;

    const stage = GROWTH_STAGES[stageIndex];
    const now = Date.now();

    // Skip "Almost There" for short milestones (under 1 hour)
    if (milestoneDurationMs < SHORT_MILESTONE_THRESHOLD_MS) {
      console.log(`[Notifications] Skipping "Almost There" for short milestone: ${stage.label}`);
      return;
    }

    // Calculate 75% progress point
    const almostThereTime = milestoneStartTime + (milestoneDurationMs * ALMOST_THERE_PROGRESS_THRESHOLD);
    const almostThereDate = new Date(almostThereTime);

    // Don't schedule if already past 75%
    if (almostThereTime <= now) return;

    // Don't schedule if more than 7 days away
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    if (almostThereTime > sevenDaysFromNow) return;

    const identifier = `milestone-almost-${stageIndex}`;

    // Cancel existing notification for this milestone
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${stage.emoji} Almost There!`,
        body: `You're 75% of the way to "${stage.label}"! Keep going, you're so close!`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'milestones' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: almostThereDate,
      },
    });

    console.log(`[Notifications] Almost There notification scheduled for stage ${stageIndex} (${stage.label}) at ${almostThereDate.toISOString()}`);
  }

  /**
   * Schedule upcoming milestone notifications based on current progress
   * Schedules both "Almost There" (at 75%) and "Achieved" notifications
   */
  async scheduleUpcomingMilestones(
    journeyStartTime: number,
    lastRelapseTime: number | null
  ): Promise<void> {
    const enabled = await this.areMilestoneNotificationsEnabled();
    if (!enabled) return;

    const referenceTime = lastRelapseTime || journeyStartTime;
    const now = Date.now();
    const elapsedMs = now - referenceTime;

    // Track previous milestone to calculate segment duration
    let previousMilestoneMs = 0;

    // Find the next milestones and schedule notifications
    for (let i = 0; i < GROWTH_STAGES.length; i++) {
      const stage = GROWTH_STAGES[i];
      const stageMs = stage.minDays * 24 * 60 * 60 * 1000;

      if (stageMs > elapsedMs) {
        // This milestone hasn't been reached yet
        const targetTime = referenceTime + stageMs;
        const targetDate = new Date(targetTime);

        // Calculate milestone segment duration (from previous milestone to this one)
        const milestoneDurationMs = stageMs - previousMilestoneMs;

        // Only schedule if within the next 7 days
        const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
        if (targetTime <= sevenDaysFromNow) {
          // Schedule "Achieved" notification (always)
          await this.scheduleMilestoneAchievedNotification(i, targetDate);

          // Schedule "Almost There" notification (skipped for short milestones)
          const segmentStartTime = referenceTime + previousMilestoneMs;
          await this.scheduleAlmostThereNotification(i, milestoneDurationMs, segmentStartTime);
        }
      }

      // Update previous milestone for next iteration
      previousMilestoneMs = stageMs;
    }

    console.log('[Notifications] Milestone notifications scheduled');
  }

  /**
   * Send an immediate notification
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    channelId: string = 'default'
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Full reset of notification service - call during app data reset
   * Cancels all notifications and resets initialization state
   */
  async resetNotificationService(): Promise<void> {
    try {
      // Cancel all scheduled notifications from OS
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Reset initialized flag to allow fresh initialization
      this.initialized = false;

      console.log('[Notifications] Service fully reset');
    } catch (error) {
      console.error('[Notifications] Reset error:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
