import { create } from 'zustand';
import type { Activity, ActivityInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';
import * as Crypto from 'expo-crypto';

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

interface ActivityActions {
  loadActivities: () => Promise<void>;
  addActivity: (input: ActivityInput) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial state
  activities: [],
  loading: false,
  error: null,

  // Actions
  loadActivities: async () => {
    set({ loading: true, error: null });
    try {
      // Load up to 1000 most recent activities for performance
      const activities = await dbHelpers.getActivities(1000);
      set({ activities, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load activities',
        loading: false,
      });
    }
  },

  addActivity: async (input: ActivityInput) => {
    // Generate optimistic ID using crypto UUID to prevent collisions
    const optimisticId = `temp-${Crypto.randomUUID()}`;
    const timestamp = input.timestamp || new Date().toISOString();

    const optimisticActivity: Activity = {
      id: optimisticId,
      timestamp,
      note: input.note,
      categories: input.categories,
    };

    // Optimistic update - add immediately to UI
    set((state) => ({
      activities: [optimisticActivity, ...state.activities],
      loading: false,
    }));

    try {
      // Perform actual database insert
      const newActivity = await dbHelpers.addActivity(input);

      // Replace optimistic entry with real one
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === optimisticId ? newActivity : a
        ),
        error: null,
      }));
    } catch (error) {
      // Rollback on error - remove optimistic entry
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== optimisticId),
        error: error instanceof Error ? error.message : 'Failed to add activity',
      }));
      throw error;
    }
  },

  deleteActivity: async (id: string) => {
    // Store the activity for potential rollback
    const activityToDelete = get().activities.find((a) => a.id === id);

    // Optimistic update - remove immediately from UI
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      loading: false,
    }));

    try {
      // Perform actual database delete
      await dbHelpers.deleteActivity(id);
      set({ error: null });
    } catch (error) {
      // Rollback on error - restore the deleted activity
      if (activityToDelete) {
        set((state) => ({
          activities: [activityToDelete, ...state.activities].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
          error: error instanceof Error ? error.message : 'Failed to delete activity',
        }));
      }
      throw error;
    }
  },
}));
