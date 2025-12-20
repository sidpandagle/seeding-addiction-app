import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AchievementStore {
  lastCheckedElapsedTime: number;
  setLastCheckedElapsedTime: (time: number) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  resetAchievements: () => Promise<void>;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set) => ({
      lastCheckedElapsedTime: 0,
      setLastCheckedElapsedTime: (time: number) => set({ lastCheckedElapsedTime: time }),
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      resetAchievements: async () => {
        // Clear from AsyncStorage directly
        await AsyncStorage.removeItem('achievement-storage');
        // Reset store state
        set({ lastCheckedElapsedTime: 0, _hasHydrated: false });
      },
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
