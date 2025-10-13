import { create } from 'zustand';
import type { Urge, UrgeInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';
import * as Crypto from 'expo-crypto';

interface UrgeState {
  urges: Urge[];
  loading: boolean;
  error: string | null;
}

interface UrgeActions {
  loadUrges: () => Promise<void>;
  addUrge: (input: UrgeInput) => Promise<void>;
  deleteUrge: (id: string) => Promise<void>;
}

type UrgeStore = UrgeState & UrgeActions;

export const useUrgeStore = create<UrgeStore>((set, get) => ({
  // Initial state
  urges: [],
  loading: false,
  error: null,

  // Actions
  loadUrges: async () => {
    set({ loading: true, error: null });
    try {
      // Load up to 1000 most recent urges for performance
      const urges = await dbHelpers.getUrges(1000);
      set({ urges, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load urges',
        loading: false,
      });
    }
  },

  addUrge: async (input: UrgeInput) => {
    // Generate optimistic ID using crypto UUID to prevent collisions
    const optimisticId = `temp-${Crypto.randomUUID()}`;
    const timestamp = input.timestamp || new Date().toISOString();
    
    const optimisticUrge: Urge = {
      id: optimisticId,
      timestamp,
      note: input.note,
      context: input.context,
    };

    // Optimistic update - add immediately to UI
    set((state) => ({
      urges: [optimisticUrge, ...state.urges],
      loading: false,
    }));

    try {
      // Perform actual database insert
      const newUrge = await dbHelpers.addUrge(input);
      
      // Replace optimistic entry with real one
      set((state) => ({
        urges: state.urges.map((u) =>
          u.id === optimisticId ? newUrge : u
        ),
        error: null,
      }));
    } catch (error) {
      // Rollback on error - remove optimistic entry
      set((state) => ({
        urges: state.urges.filter((u) => u.id !== optimisticId),
        error: error instanceof Error ? error.message : 'Failed to add urge',
      }));
      throw error;
    }
  },

  deleteUrge: async (id: string) => {
    // Store the urge for potential rollback
    const urgeToDelete = get().urges.find((u) => u.id === id);
    
    // Optimistic update - remove immediately from UI
    set((state) => ({
      urges: state.urges.filter((u) => u.id !== id),
      loading: false,
    }));

    try {
      // Perform actual database delete
      await dbHelpers.deleteUrge(id);
      set({ error: null });
    } catch (error) {
      // Rollback on error - restore the deleted urge
      if (urgeToDelete) {
        set((state) => ({
          urges: [urgeToDelete, ...state.urges].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
          error: error instanceof Error ? error.message : 'Failed to delete urge',
        }));
      }
      throw error;
    }
  },
}));
