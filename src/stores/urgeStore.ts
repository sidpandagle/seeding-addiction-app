import { create } from 'zustand';
import type { Urge, UrgeInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';

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

export const useUrgeStore = create<UrgeStore>((set) => ({
  // Initial state
  urges: [],
  loading: false,
  error: null,

  // Actions
  loadUrges: async () => {
    set({ loading: true, error: null });
    try {
      const urges = await dbHelpers.getUrges();
      set({ urges, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load urges',
        loading: false,
      });
    }
  },

  addUrge: async (input: UrgeInput) => {
    set({ loading: true, error: null });
    try {
      const newUrge = await dbHelpers.addUrge(input);
      set((state) => ({
        urges: [newUrge, ...state.urges],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add urge',
        loading: false,
      });
    }
  },

  deleteUrge: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await dbHelpers.deleteUrge(id);
      set((state) => ({
        urges: state.urges.filter((u) => u.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete urge',
        loading: false,
      });
    }
  },
}));
