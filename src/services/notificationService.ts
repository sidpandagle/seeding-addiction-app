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

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
   */
  async scheduleRandomNotifications(): Promise<void> {
    // Cancel existing random notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('random-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Schedule 2-3 random notifications per day at varied times
    const times = [
      { hour: 10, minute: Math.floor(Math.random() * 60) },
      { hour: 15, minute: Math.floor(Math.random() * 60) },
      { hour: 20, minute: Math.floor(Math.random() * 60) },
    ];

    for (let i = 0; i < times.length; i++) {
      const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

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

    console.log('[Notifications] Random notifications scheduled');
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
  }

  /**
   * Schedule milestone prediction notification
   * Called when we know the user is approaching a milestone
   */
  async scheduleMilestoneNotification(
    stageIndex: number,
    targetDate: Date
  ): Promise<void> {
    if (stageIndex >= GROWTH_STAGES.length) return;

    const stage = GROWTH_STAGES[stageIndex];
    const now = new Date();

    // Don't schedule if the target date is in the past
    if (targetDate <= now) return;

    // Schedule for slightly before the milestone (1 hour before)
    const notificationTime = new Date(targetDate.getTime() - 60 * 60 * 1000);

    if (notificationTime <= now) {
      // If less than an hour away, schedule immediately
      return;
    }

    const identifier = `milestone-${stageIndex}`;

    // Cancel existing notification for this milestone
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${stage.emoji} Almost There!`,
        body: `You're about to reach "${stage.label}"! Keep going, you're so close!`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'milestones' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
      },
    });

    console.log(`[Notifications] Milestone notification scheduled for stage ${stageIndex}`);
  }

  /**
   * Schedule upcoming milestone notifications based on current progress
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

    // Find the next few milestones and schedule notifications
    for (let i = 0; i < GROWTH_STAGES.length; i++) {
      const stage = GROWTH_STAGES[i];
      const stageMs = stage.minDays * 24 * 60 * 60 * 1000;

      if (stageMs > elapsedMs) {
        // This milestone hasn't been reached yet
        const targetTime = referenceTime + stageMs;
        const targetDate = new Date(targetTime);

        // Only schedule if within the next 7 days
        const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
        if (targetTime <= sevenDaysFromNow) {
          await this.scheduleMilestoneNotification(i, targetDate);
        }
      }
    }
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
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
