import { create } from 'zustand';
import type { Relapse, RelapseInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';

interface RelapseState {
  relapses: Relapse[];
  loading: boolean;
  error: string | null;
}

interface RelapseActions {
  loadRelapses: () => Promise<void>;
  addRelapse: (input: RelapseInput) => Promise<void>;
  deleteRelapse: (id: string) => Promise<void>;
  updateRelapse: (id: string, updates: Partial<RelapseInput>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

type RelapseStore = RelapseState & RelapseActions;

export const useRelapseStore = create<RelapseStore>((set) => ({
  // Initial state
  relapses: [],
  loading: false,
  error: null,

  // Actions
  loadRelapses: async () => {
    set({ loading: true, error: null });
    try {
      const relapses = await dbHelpers.getRelapses();
      set({ relapses, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load relapses',
        loading: false,
      });
    }
  },

  addRelapse: async (input: RelapseInput) => {
    set({ loading: true, error: null });
    try {
      const newRelapse = await dbHelpers.addRelapse(input);
      set((state) => ({
        relapses: [newRelapse, ...state.relapses],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add relapse',
        loading: false,
      });
    }
  },

  deleteRelapse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await dbHelpers.deleteRelapse(id);
      set((state) => ({
        relapses: state.relapses.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete relapse',
        loading: false,
      });
    }
  },

  updateRelapse: async (id: string, updates: Partial<RelapseInput>) => {
    set({ loading: true, error: null });
    try {
      const updatedRelapse = await dbHelpers.updateRelapse(id, updates);
      if (updatedRelapse) {
        set((state) => ({
          relapses: state.relapses.map((r) =>
            r.id === id ? updatedRelapse : r
          ),
          loading: false,
        }));
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
      await dbHelpers.resetDatabase();
      set({ relapses: [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset data',
        loading: false,
      });
    }
  },
}));
