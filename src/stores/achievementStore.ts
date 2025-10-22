import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AchievementStore {
  lastCheckedElapsedTime: number;
  setLastCheckedElapsedTime: (time: number) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set) => ({
      lastCheckedElapsedTime: 0,
      setLastCheckedElapsedTime: (time: number) => set({ lastCheckedElapsedTime: time }),
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
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
