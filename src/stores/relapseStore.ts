import { create } from 'zustand';
import type { Relapse, RelapseInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';
import * as Crypto from 'expo-crypto';
import { notificationService } from '../services/notificationService';
import { useAchievementStore } from './achievementStore';
import { useNotificationStore } from './notificationStore';
import { useCustomActivityTagsStore } from './customActivityTagsStore';
import { useBadgeStore } from './badgeStore';

interface RelapseState {
  relapses: Relapse[];
  loading: boolean;
  error: string | null;
  // Cached latest relapse timestamp to avoid repeated calculations
  latestTimestamp: string | null;
}

interface RelapseActions {
  loadRelapses: () => Promise<void>;
  addRelapse: (input: RelapseInput) => Promise<void>;
  deleteRelapse: (id: string) => Promise<void>;
  updateRelapse: (id: string, updates: Partial<RelapseInput>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

type RelapseStore = RelapseState & RelapseActions;

// Helper to calculate latest timestamp from relapses array
function calculateLatestTimestamp(relapses: Relapse[]): string | null {
  if (relapses.length === 0) return null;

  let maxTimestamp = relapses[0].timestamp;
  let maxTime = new Date(maxTimestamp).getTime();

  for (let i = 1; i < relapses.length; i++) {
    const currentTime = new Date(relapses[i].timestamp).getTime();
    if (currentTime > maxTime) {
      maxTimestamp = relapses[i].timestamp;
      maxTime = currentTime;
    }
  }
  return maxTimestamp;
}

export const useRelapseStore = create<RelapseStore>((set, get) => ({
  // Initial state
  relapses: [],
  loading: false,
  error: null,
  latestTimestamp: null,

  // Actions
  loadRelapses: async () => {
    set({ loading: true, error: null });
    try {
      // Load up to 1000 most recent relapses for performance
      const relapses = await dbHelpers.getRelapses(1000);
      const latestTimestamp = calculateLatestTimestamp(relapses);
      set({ relapses, latestTimestamp, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load relapses',
        loading: false,
      });
    }
  },

  addRelapse: async (input: RelapseInput) => {
    // Generate optimistic ID using crypto UUID to prevent collisions
    const optimisticId = `temp-${Crypto.randomUUID()}`;
    const timestamp = input.timestamp || new Date().toISOString();

    const optimisticRelapse: Relapse = {
      id: optimisticId,
      timestamp,
      note: input.note,
      tags: input.tags,
    };

    // Optimistic update - add immediately to UI
    set((state) => {
      const newRelapses = [optimisticRelapse, ...state.relapses];
      return {
        relapses: newRelapses,
        latestTimestamp: calculateLatestTimestamp(newRelapses),
        loading: false,
      };
    });

    try {
      // Perform actual database insert
      const newRelapse = await dbHelpers.addRelapse(input);

      // Replace optimistic entry with real one
      set((state) => {
        const updatedRelapses = state.relapses.map((r) =>
          r.id === optimisticId ? newRelapse : r
        );
        return {
          relapses: updatedRelapses,
          latestTimestamp: calculateLatestTimestamp(updatedRelapses),
          error: null,
        };
      });
    } catch (error) {
      // Rollback on error - remove optimistic entry
      set((state) => {
        const rolledBackRelapses = state.relapses.filter((r) => r.id !== optimisticId);
        return {
          relapses: rolledBackRelapses,
          latestTimestamp: calculateLatestTimestamp(rolledBackRelapses),
          error: error instanceof Error ? error.message : 'Failed to add relapse',
        };
      });
      throw error; // Re-throw to let caller handle
    }
  },

  deleteRelapse: async (id: string) => {
    // Store the relapse for potential rollback
    const relapseToDelete = get().relapses.find((r) => r.id === id);

    // Optimistic update - remove immediately from UI
    set((state) => {
      const filteredRelapses = state.relapses.filter((r) => r.id !== id);
      return {
        relapses: filteredRelapses,
        latestTimestamp: calculateLatestTimestamp(filteredRelapses),
        loading: false,
      };
    });

    try {
      // Perform actual database delete
      await dbHelpers.deleteRelapse(id);
      set({ error: null });
    } catch (error) {
      // Rollback on error - restore the deleted relapse
      if (relapseToDelete) {
        set((state) => {
          const restoredRelapses = [relapseToDelete, ...state.relapses].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          return {
            relapses: restoredRelapses,
            latestTimestamp: calculateLatestTimestamp(restoredRelapses),
            error: error instanceof Error ? error.message : 'Failed to delete relapse',
          };
        });
      }
      throw error;
    }
  },

  updateRelapse: async (id: string, updates: Partial<RelapseInput>) => {
    set({ loading: true, error: null });
    try {
      const updatedRelapse = await dbHelpers.updateRelapse(id, updates);
      if (updatedRelapse) {
        set((state) => {
          const updatedRelapses = state.relapses.map((r) =>
            r.id === id ? updatedRelapse : r
          );
          return {
            relapses: updatedRelapses,
            latestTimestamp: calculateLatestTimestamp(updatedRelapses),
            loading: false,
          };
        });
      } else {
        set({
          error: 'Relapse not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update relapse',
        loading: false,
      });
    }
  },

  resetAllData: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Cancel all scheduled notifications first
      await notificationService.resetNotificationService();

      // 2. Reset database (clears all app_settings including notification settings)
      await dbHelpers.resetDatabase();

      // 3. Reset AsyncStorage stores
      await useAchievementStore.getState().resetAchievements();
      await useBadgeStore.getState().resetBadges();

      // 4. Reset notification store state
      await useNotificationStore.getState().resetNotifications();

      // 5. Reset custom activity tags store (data already cleared in app_settings)
      useCustomActivityTagsStore.setState({ customTags: [] });

      // 6. Reset this store's state
      set({ relapses: [], latestTimestamp: null, loading: false });

      console.log('[RelapseStore] Full reset completed');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset data',
        loading: false,
      });
    }
  },
}));

/**
 * Select only the relapses array
 * Use when you only need relapse data, not loading/error states
 */
export const useRelapses = () => useRelapseStore((state) => state.relapses);

/**
 * Select only the loading state
 * Use when you only need to show loading indicators
 */
export const useRelapsesLoading = () => useRelapseStore((state) => state.loading);

/**
 * Select only the error state
 * Use when you only need to display error messages
 */
export const useRelapsesError = () => useRelapseStore((state) => state.error);

/**
 * Select only the actions (never causes re-renders)
 * Use when you only need to call actions, not read state
 */
export const useRelapseActions = () => useRelapseStore((state) => ({
  loadRelapses: state.loadRelapses,
  addRelapse: state.addRelapse,
  deleteRelapse: state.deleteRelapse,
  updateRelapse: state.updateRelapse,
  resetAllData: state.resetAllData,
}));

/**
 * Select relapse count only (memoized to prevent re-renders on same count)
 * Use when you only need the number of relapses
 */
export const useRelapseCount = () => useRelapseStore((state) => state.relapses.length);

/**
 * Select the most recent relapse timestamp (cached)
 * Use for calculating current streak without needing full array
 * This selector is highly optimized - it reads a pre-computed value
 */
export const useLatestRelapseTimestamp = () => useRelapseStore((state) => state.latestTimestamp);
