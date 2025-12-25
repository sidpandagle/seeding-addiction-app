import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EarnedBadge, BadgeWithStatus } from '../db/schema';

interface BadgeProgress {
  badgeId: string;
  progress: number; // 0-1
  current: number;
  required: number;
}

interface BadgeStore {
  earnedBadges: EarnedBadge[];
  badgeProgress: Record<string, BadgeProgress>;
  loading: boolean;
  _hasHydrated: boolean;

  // Actions
  setEarnedBadges: (badges: EarnedBadge[]) => void;
  addEarnedBadge: (badge: EarnedBadge) => void;
  setBadgeProgress: (badgeId: string, progress: BadgeProgress) => void;
  clearBadgeProgress: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  resetBadges: () => Promise<void>;

  // Selectors
  isBadgeEarned: (badgeId: string) => boolean;
  getBadgeProgress: (badgeId: string) => BadgeProgress | null;
  getRecentBadges: (limit?: number) => EarnedBadge[];
}

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      earnedBadges: [],
      badgeProgress: {},
      loading: false,
      _hasHydrated: false,

      setEarnedBadges: (badges: EarnedBadge[]) => set({ earnedBadges: badges }),

      addEarnedBadge: (badge: EarnedBadge) =>
        set((state) => ({
          earnedBadges: [...state.earnedBadges, badge],
        })),

      setBadgeProgress: (badgeId: string, progress: BadgeProgress) =>
        set((state) => ({
          badgeProgress: {
            ...state.badgeProgress,
            [badgeId]: progress,
          },
        })),

      clearBadgeProgress: () => set({ badgeProgress: {} }),

      setLoading: (loading: boolean) => set({ loading }),

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      resetBadges: async () => {
        await AsyncStorage.removeItem('badge-storage');
        set({ earnedBadges: [], badgeProgress: {}, _hasHydrated: false });
      },

      // Selectors
      isBadgeEarned: (badgeId: string) => {
        const { earnedBadges } = get();
        return earnedBadges.some((b) => b.badge_id === badgeId);
      },

      getBadgeProgress: (badgeId: string) => {
        const { badgeProgress } = get();
        return badgeProgress[badgeId] || null;
      },

      getRecentBadges: (limit = 3) => {
        const { earnedBadges } = get();
        return [...earnedBadges]
          .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: 'badge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        earnedBadges: state.earnedBadges,
        badgeProgress: state.badgeProgress,
      }),
    }
  )
);

// Selector hooks for better performance
export const useEarnedBadges = () => useBadgeStore((state) => state.earnedBadges);
export const useBadgeProgress = () => useBadgeStore((state) => state.badgeProgress);
export const useIsBadgeEarned = (badgeId: string) =>
  useBadgeStore((state) => state.isBadgeEarned(badgeId));
export const useRecentBadges = (limit?: number) =>
  useBadgeStore((state) => state.getRecentBadges(limit));
