import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../theme/colors';

interface ThemeState {
  colorScheme: ColorScheme;
  _hasHydrated: boolean;
  _isTransitioning: boolean;
  setHasHydrated: (state: boolean) => void;
  setTransitioning: (state: boolean) => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

// Optimized AsyncStorage wrapper for instant theme switching
// UI updates instantly, persistence happens immediately in background (non-blocking)
const optimizedAsyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    // Write immediately but asynchronously (non-blocking)
    // UI updates instantly while persistence happens in background
    AsyncStorage.setItem(name, value).catch((error) => {
      console.error('Failed to persist theme:', error);
    });
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
      _isTransitioning: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setTransitioning: (state) => set({ _isTransitioning: state }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
          _isTransitioning: true, // Trigger transition overlay
        })),
      setColorScheme: (scheme) => set({ colorScheme: scheme, _isTransitioning: true }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => optimizedAsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // Don't persist transition state
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        _hasHydrated: state._hasHydrated,
      }),
    }
  )
);

// Optimized selector for only color scheme - prevents unnecessary re-renders
export const useColorScheme = () => useThemeStore((state) => state.colorScheme);

// Memoized theme values to reduce conditional checks in components
export const useIsDarkMode = () => useThemeStore((state) => state.colorScheme === 'dark');
