/**
 * Notification Store (Zustand)
 * Manages notification preferences and settings with AsyncStorage persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_CONFIG } from '../constants/notificationConfig';

const STORAGE_KEY = 'notification-settings';

interface NotificationState {
  // Settings
  notificationsEnabled: boolean;
  motivationalReminderTime: string; // Format: "HH:MM" (e.g., "09:00")

  // Hydration flag
  _hasHydrated: boolean;

  // Actions
  setNotificationsEnabled: (enabled: boolean) => void;
  setMotivationalReminderTime: (time: string) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // Persistence
  _persist: () => Promise<void>;
  _hydrate: () => Promise<void>;
}

/**
 * Notification store with AsyncStorage persistence
 * Follows the same pattern as themeStore for consistency
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Default state
  notificationsEnabled: false, // User must opt-in
  motivationalReminderTime: NOTIFICATION_CONFIG.DEFAULT_MOTIVATIONAL_TIME,
  _hasHydrated: false,

  // Actions
  setNotificationsEnabled: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    get()._persist(); // Non-blocking async persist
  },

  setMotivationalReminderTime: (time: string) => {
    set({ motivationalReminderTime: time });
    get()._persist(); // Non-blocking async persist
  },

  setHasHydrated: (hydrated: boolean) => {
    set({ _hasHydrated: hydrated });
  },

  // Persistence functions
  _persist: async () => {
    try {
      const state = get();
      const dataToStore = {
        notificationsEnabled: state.notificationsEnabled,
        motivationalReminderTime: state.motivationalReminderTime,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to persist notification settings:', error);
    }
  },

  _hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          notificationsEnabled: parsed.notificationsEnabled ?? false,
          motivationalReminderTime:
            parsed.motivationalReminderTime ?? NOTIFICATION_CONFIG.DEFAULT_MOTIVATIONAL_TIME,
          _hasHydrated: true,
        });
      } else {
        set({ _hasHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate notification settings:', error);
      set({ _hasHydrated: true }); // Mark as hydrated even on error
    }
  },
}));

// Hydrate on store creation
useNotificationStore.getState()._hydrate();

/**
 * Selectors for convenient access to notification settings
 */
export const useNotificationsEnabled = () =>
  useNotificationStore((state) => state.notificationsEnabled);

export const useMotivationalReminderTime = () =>
  useNotificationStore((state) => state.motivationalReminderTime);

export const useSetNotificationsEnabled = () =>
  useNotificationStore((state) => state.setNotificationsEnabled);

export const useSetMotivationalReminderTime = () =>
  useNotificationStore((state) => state.setMotivationalReminderTime);

export const useNotificationHydrated = () =>
  useNotificationStore((state) => state._hasHydrated);
