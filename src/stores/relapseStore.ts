import { create } from 'zustand';
import type { Relapse, RelapseInput } from '../db/schema';
import * as dbHelpers from '../db/helpers';
import * as Crypto from 'expo-crypto';

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

export const useRelapseStore = create<RelapseStore>((set, get) => ({
  // Initial state
  relapses: [],
  loading: false,
  error: null,

  // Actions
  loadRelapses: async () => {
    set({ loading: true, error: null });
    try {
      // Load up to 1000 most recent relapses for performance
      const relapses = await dbHelpers.getRelapses(1000);
      set({ relapses, loading: false });
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
    set((state) => ({
      relapses: [optimisticRelapse, ...state.relapses],
      loading: false,
    }));

    try {
      // Perform actual database insert
      const newRelapse = await dbHelpers.addRelapse(input);
      
      // Replace optimistic entry with real one
      set((state) => ({
        relapses: state.relapses.map((r) =>
          r.id === optimisticId ? newRelapse : r
        ),
        error: null,
      }));
    } catch (error) {
      // Rollback on error - remove optimistic entry
      set((state) => ({
        relapses: state.relapses.filter((r) => r.id !== optimisticId),
        error: error instanceof Error ? error.message : 'Failed to add relapse',
      }));
      throw error; // Re-throw to let caller handle
    }
  },

  deleteRelapse: async (id: string) => {
    // Store the relapse for potential rollback
    const relapseToDelete = get().relapses.find((r) => r.id === id);
    
    // Optimistic update - remove immediately from UI
    set((state) => ({
      relapses: state.relapses.filter((r) => r.id !== id),
      loading: false,
    }));

    try {
      // Perform actual database delete
      await dbHelpers.deleteRelapse(id);
      set({ error: null });
    } catch (error) {
      // Rollback on error - restore the deleted relapse
      if (relapseToDelete) {
        set((state) => ({
          relapses: [relapseToDelete, ...state.relapses].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
          error: error instanceof Error ? error.message : 'Failed to delete relapse',
        }));
      }
      throw error;
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
