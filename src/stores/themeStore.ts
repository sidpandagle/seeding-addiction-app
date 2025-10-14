import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../theme/colors';

interface ThemeState {
  colorScheme: ColorScheme;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

// Debounced AsyncStorage wrapper for instant theme switching
let debounceTimer: NodeJS.Timeout | null = null;
const debouncedAsyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce write by 500ms - UI updates instantly, persistence happens later
    debounceTimer = setTimeout(() => {
      AsyncStorage.setItem(name, value).catch((error) => {
        console.error('Failed to persist theme:', error);
      });
    }, 500);
  },
  removeItem: async (name: string): Promise<void> => {
    return await AsyncStorage.removeItem(name);
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'light',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
        })),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => debouncedAsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Optimized selector for only color scheme - prevents unnecessary re-renders
export const useColorScheme = () => useThemeStore((state) => state.colorScheme);
