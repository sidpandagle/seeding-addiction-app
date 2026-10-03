import type * as NotificationsModule from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { getAppSetting, setAppSetting } from '../db/helpers';
import { GROWTH_STAGES } from '../utils/growthStages';

// Expo Go on Android dropped support for expo-notifications (SDK 53+). Merely
// *importing* the module throws "Android Push notifications ... removed from
// Expo Go" - it has a module-scope side effect (push token auto-registration)
// that fires on load, before any of our code runs. A `require` guarded by a
// runtime check (instead of a static `import`, which Metro always evaluates)
// keeps that module out of the graph entirely in that environment.
const isUnsupportedInExpoGo =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const Notifications: typeof NotificationsModule = isUnsupportedInExpoGo
  ? ({} as typeof NotificationsModule)
  : require('expo-notifications');

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
if (!isUnsupportedInExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Daily check-in reminder messages
export const DAILY_REMINDER_MESSAGES = [
  { title: '🌱 Daily Check-In', body: 'How are you doing today? Take a moment to track your growth!' },
  { title: '🌿 Good Morning!', body: 'A new day, a fresh start. How\'s your journey going today?' },
  { title: '💚 Time To Check In', body: 'Remember to nurture your growth today. How are you feeling?' },
  { title: '🌸 Daily Reflection', body: 'Take a moment for yourself. Track your progress and celebrate!' },
  { title: '🌟 You\'re Doing Great!', body: 'Time for your daily check-in. Let\'s see how you\'re growing!' },
  { title: '🌺 Mindful Moment', body: 'Pause and reflect on your journey. How are you today?' },
  { title: '☀️ Rise & Shine!', body: 'A beautiful day to grow stronger. Time for your check-in!' },
  { title: '🌼 Daily Care', body: 'Take a moment for self-care and reflection. Check in with yourself!' },
  { title: '🦋 Progress Check', body: 'Every day is transformation. How are you feeling right now?' },
  { title: '💫 Your Daily Moment', body: 'This is your time to reflect and grow. How\'s your day going?' },
];

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
  { title: '🌟 Believe In Yourself', body: 'You have the strength within you. Every day you prove it.' },
  { title: '🌺 Beautiful Progress', body: 'Look how far you\'ve come! Each step forward is a victory.' },
  { title: '💫 You\'re Amazing', body: 'The fact that you\'re here trying means everything. Keep going!' },
  { title: '🌼 Small Wins Count', body: 'Every small victory is building the new you. Celebrate yourself today!' },
  { title: '🍃 Fresh Start', body: 'Every moment is a chance to begin again. You\'ve got this!' },
  { title: '🎈 Rise Above', body: 'You\'re stronger than your urges. You\'ve proven it before, you\'ll do it again.' },
  { title: '🌹 Self-Love Journey', body: 'You deserve kindness, especially from yourself. Be gentle today.' },
  { title: '☀️ New Day, New Strength', body: 'Each sunrise brings fresh courage. Embrace it!' },
  { title: '🎨 Creating Your Future', body: 'Every healthy choice is a brushstroke painting your best life.' },
  { title: '🌊 Ride The Wave', body: 'Urges come and go like waves. You\'re learning to surf them beautifully.' },
  { title: '🦁 Inner Courage', body: 'There\'s a lion inside you. Feel that strength and roar!' },
  { title: '🌙 Night Victory', body: 'You made it through another day. That\'s worth celebrating!' },
  { title: '🏔️ Mountain Climber', body: 'Some days are harder than others. But you\'re still climbing!' },
  { title: '💝 Worthy Of Love', body: 'You are worthy of love, peace, and all the good things life offers.' },
  { title: '🌏 Your Journey Matters', body: 'Your progress, no matter how small, is changing your world.' },
  { title: '🎁 Gift To Future You', body: 'Every moment of resistance is a gift to your future self. Thank you!' },
  { title: '🕊️ Peace Within', body: 'You\'re creating inner peace one choice at a time. Keep nurturing it.' },
  { title: '🌤️ Brighter Days', body: 'The clouds will pass. You\'re moving toward brighter days!' },
  { title: '💖 Proud Of You', body: 'Wherever you are on your journey, know that we\'re proud of you.' },
  { title: '🎯 Focus On Today', body: 'You don\'t have to be perfect forever, just for today. And you\'re doing it!' },
];

class NotificationService {
  private initialized = false;

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (isUnsupportedInExpoGo) {
      if (__DEV__) console.log('[Notifications] Not supported in Expo Go on Android; use a development build');
      return false;
    }

    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        if (__DEV__) console.log('[Notifications] Physical device required for notifications');
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
        if (__DEV__) console.log('[Notifications] Permission not granted');
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
      if (__DEV__) console.log('[Notifications] Initialized successfully');
      return true;
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Initialization error:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const setting = await getAppSetting(NOTIFICATIONS_ENABLED_KEY);
    return setting !== 'false'; // Default to true for new users
  }

  /**
   * Enable or disable notifications
   */
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await setAppSetting(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    if (isUnsupportedInExpoGo) return;

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
    if (isUnsupportedInExpoGo) return;
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');
  }

  /**
   * Schedule daily check-in reminder with rotating messages
   */
  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    if (isUnsupportedInExpoGo) return;

    // Cancel existing daily reminder
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');

    // Rotate through messages based on day of week
    const dayOfWeek = new Date().getDay();
    const messageIndex = dayOfWeek % DAILY_REMINDER_MESSAGES.length;
    const message = DAILY_REMINDER_MESSAGES[messageIndex];

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reminder',
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    if (__DEV__) console.log(`[Notifications] Daily reminder scheduled for ${hour}:${minute}`);
  }

  /**
   * Check if random notifications are enabled
   */
  async areRandomNotificationsEnabled(): Promise<boolean> {
    const setting = await getAppSetting(RANDOM_NOTIFICATIONS_KEY);
    return setting !== 'false'; // Default to true for new users
  }

  /**
   * Enable or disable random notifications
   */
  async setRandomNotificationsEnabled(enabled: boolean): Promise<void> {
    await setAppSetting(RANDOM_NOTIFICATIONS_KEY, enabled ? 'true' : 'false');
    if (isUnsupportedInExpoGo) return;

    if (enabled) {
      await this.scheduleRandomNotifications();
    } else {
      // Cancel random notifications in parallel (much faster than sequential)
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const randomNotifs = scheduled.filter(n => n.identifier.startsWith('random-'));
      await Promise.all(
        randomNotifs.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    }
  }

  /**
   * Schedule random motivational notifications throughout the day
   * Uses fixed times to prevent duplicate/inconsistent scheduling
   */
  async scheduleRandomNotifications(): Promise<void> {
    if (isUnsupportedInExpoGo) return;

    // Cancel existing random notifications first (in parallel for performance)
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const randomNotifications = scheduled.filter(n => n.identifier.startsWith('random-'));
    await Promise.all(
      randomNotifications.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );

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

    if (__DEV__) console.log('[Notifications] Random notifications scheduled at fixed times');
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
    if (isUnsupportedInExpoGo) return;

    if (!enabled) {
      // Cancel all milestone notifications when disabled
      await this.cancelMilestoneNotifications();
    }
  }

  /**
   * Cancel all scheduled milestone notifications (both "Almost There" and "Achieved")
   */
  async cancelMilestoneNotifications(): Promise<void> {
    if (isUnsupportedInExpoGo) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    let cancelledCount = 0;

    for (const notif of scheduled) {
      // Cancel both milestone-almost-* and milestone-achieved-* notifications
      if (notif.identifier.startsWith('milestone-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        cancelledCount++;
      }
    }

    if (__DEV__) console.log(`[Notifications] Milestone notifications cancelled (${cancelledCount} total)`);
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
    if (stageIndex >= GROWTH_STAGES.length || isUnsupportedInExpoGo) return;

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

    if (__DEV__) console.log(`[Notifications] Milestone ACHIEVED notification scheduled for stage ${stageIndex} (${stage.label}) at ${targetDate.toISOString()}`);
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
    if (stageIndex >= GROWTH_STAGES.length || isUnsupportedInExpoGo) return;

    const stage = GROWTH_STAGES[stageIndex];
    const now = Date.now();

    // Skip "Almost There" for short milestones (under 1 hour)
    if (milestoneDurationMs < SHORT_MILESTONE_THRESHOLD_MS) {
      if (__DEV__) console.log(`[Notifications] Skipping "Almost There" for short milestone: ${stage.label}`);
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

    if (__DEV__) console.log(`[Notifications] Almost There notification scheduled for stage ${stageIndex} (${stage.label}) at ${almostThereDate.toISOString()}`);
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

    if (__DEV__) console.log('[Notifications] Milestone notifications scheduled');
  }

  /**
   * Send an immediate notification
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    channelId: string = 'default'
  ): Promise<void> {
    if (isUnsupportedInExpoGo) return;
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
    if (isUnsupportedInExpoGo) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Full reset of notification service - call during app data reset
   * Cancels all notifications and resets initialization state
   */
  async resetNotificationService(): Promise<void> {
    try {
      // Cancel all scheduled notifications from OS
      if (!isUnsupportedInExpoGo) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }

      // Reset initialized flag to allow fresh initialization
      this.initialized = false;

      if (__DEV__) console.log('[Notifications] Service fully reset');
    } catch (error) {
      if (__DEV__) console.error('[Notifications] Reset error:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications() {
    if (isUnsupportedInExpoGo) return [];
    return Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
