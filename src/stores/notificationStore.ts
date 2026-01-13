import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  isInitialized: boolean;
  isEnabled: boolean;
  dailyReminderTime: { hour: number; minute: number } | null;
  randomNotificationsEnabled: boolean;
  milestoneNotificationsEnabled: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<boolean>;
  loadSettings: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setDailyReminder: (hour: number, minute: number) => Promise<void>;
  clearDailyReminder: () => Promise<void>;
  setRandomNotifications: (enabled: boolean) => Promise<void>;
  setMilestoneNotifications: (enabled: boolean) => Promise<void>;
  scheduleUpcomingMilestones: (journeyStartTime: number, lastRelapseTime: number | null) => Promise<void>;
  resetNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  isInitialized: false,
  isEnabled: true, // Default to enabled for new users
  dailyReminderTime: null,
  randomNotificationsEnabled: true, // Default to enabled for new users
  milestoneNotificationsEnabled: true,
  isLoading: false,

  initialize: async () => {
    if (get().isInitialized) return true;

    set({ isLoading: true });
    try {
      const success = await notificationService.initialize();
      set({ isInitialized: success });

      if (success) {
        await get().loadSettings();
      }

      return success;
    } catch (error) {
      console.error('[NotificationStore] Initialize error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loadSettings: async () => {
    try {
      const [
        isEnabled,
        dailyReminderTime,
        randomEnabled,
        milestoneEnabled
      ] = await Promise.all([
        notificationService.areNotificationsEnabled(),
        notificationService.getDailyReminderTime(),
        notificationService.areRandomNotificationsEnabled(),
        notificationService.areMilestoneNotificationsEnabled(),
      ]);

      set({
        isEnabled,
        dailyReminderTime,
        randomNotificationsEnabled: randomEnabled,
        milestoneNotificationsEnabled: milestoneEnabled,
      });
    } catch (error) {
      console.error('[NotificationStore] Load settings error:', error);
    }
  },

  setEnabled: async (enabled: boolean) => {
    set({ isLoading: true });
    try {
      await notificationService.setNotificationsEnabled(enabled);
      set({ isEnabled: enabled });

      // If enabling, enable all notification types and set defaults
      if (enabled) {
        let { dailyReminderTime, randomNotificationsEnabled, milestoneNotificationsEnabled } = get();

        // Enable all notification types
        if (!randomNotificationsEnabled) {
          await notificationService.setRandomNotificationsEnabled(true);
          set({ randomNotificationsEnabled: true });
        }

        if (!milestoneNotificationsEnabled) {
          await notificationService.setMilestoneNotificationsEnabled(true);
          set({ milestoneNotificationsEnabled: true });
        }

        // Set default daily reminder time to 9:00 AM if not set
        if (!dailyReminderTime) {
          const defaultHour = 9;
          const defaultMinute = 0;
          await notificationService.setDailyReminderTime(defaultHour, defaultMinute);
          set({ dailyReminderTime: { hour: defaultHour, minute: defaultMinute } });
          dailyReminderTime = { hour: defaultHour, minute: defaultMinute };
        }

        // Schedule notifications based on current settings
        if (dailyReminderTime) {
          await notificationService.scheduleDailyReminder(
            dailyReminderTime.hour,
            dailyReminderTime.minute
          );
        }

        await notificationService.scheduleRandomNotifications();
      }
    } catch (error) {
      console.error('[NotificationStore] Set enabled error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setDailyReminder: async (hour: number, minute: number) => {
    set({ isLoading: true });
    try {
      await notificationService.setDailyReminderTime(hour, minute);
      set({ dailyReminderTime: { hour, minute } });
    } catch (error) {
      console.error('[NotificationStore] Set daily reminder error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearDailyReminder: async () => {
    set({ isLoading: true });
    try {
      await notificationService.clearDailyReminder();
      set({ dailyReminderTime: null });
    } catch (error) {
      console.error('[NotificationStore] Clear daily reminder error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setRandomNotifications: async (enabled: boolean) => {
    set({ isLoading: true });
    try {
      await notificationService.setRandomNotificationsEnabled(enabled);
      set({ randomNotificationsEnabled: enabled });
    } catch (error) {
      console.error('[NotificationStore] Set random notifications error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setMilestoneNotifications: async (enabled: boolean) => {
    set({ isLoading: true });
    try {
      await notificationService.setMilestoneNotificationsEnabled(enabled);
      set({ milestoneNotificationsEnabled: enabled });
    } catch (error) {
      console.error('[NotificationStore] Set milestone notifications error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  scheduleUpcomingMilestones: async (journeyStartTime: number, lastRelapseTime: number | null) => {
    try {
      await notificationService.scheduleUpcomingMilestones(journeyStartTime, lastRelapseTime);
    } catch (error) {
      console.error('[NotificationStore] Schedule milestones error:', error);
    }
  },

  resetNotifications: async () => {
    try {
      await notificationService.resetNotificationService();
      set({
        isInitialized: false,
        isEnabled: true, // Reset to default (enabled)
        dailyReminderTime: null,
        randomNotificationsEnabled: true, // Reset to default (enabled)
        milestoneNotificationsEnabled: true, // Reset to default
        isLoading: false,
      });
    } catch (error) {
      console.error('[NotificationStore] Reset error:', error);
    }
  },
}));
