/**
 * Achievement Store (Zustand)
 * Tracks last checked elapsed time to detect missed achievements
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'achievement-tracking';

interface AchievementState {
  // Last elapsed time we checked for achievements (in milliseconds)
  lastCheckedElapsedTime: number;

  // Hydration flag
  _hasHydrated: boolean;

  // Actions
  setLastCheckedElapsedTime: (time: number) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // Persistence
  _persist: () => Promise<void>;
  _hydrate: () => Promise<void>;
}

/**
 * Achievement tracking store with AsyncStorage persistence
 */
export const useAchievementStore = create<AchievementState>((set, get) => ({
  // Default state
  lastCheckedElapsedTime: 0,
  _hasHydrated: false,

  // Actions
  setLastCheckedElapsedTime: (time: number) => {
    set({ lastCheckedElapsedTime: time });
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
        lastCheckedElapsedTime: state.lastCheckedElapsedTime,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to persist achievement tracking:', error);
    }
  },

  _hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          lastCheckedElapsedTime: parsed.lastCheckedElapsedTime ?? 0,
          _hasHydrated: true,
        });
      } else {
        set({ _hasHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate achievement tracking:', error);
      set({ _hasHydrated: true }); // Mark as hydrated even on error
    }
  },
}));

// Hydrate on store creation
useAchievementStore.getState()._hydrate();

/**
 * Selectors for convenient access
 */
export const useLastCheckedElapsedTime = () =>
  useAchievementStore((state) => state.lastCheckedElapsedTime);

export const useSetLastCheckedElapsedTime = () =>
  useAchievementStore((state) => state.setLastCheckedElapsedTime);

export const useAchievementStoreHydrated = () =>
  useAchievementStore((state) => state._hasHydrated);
