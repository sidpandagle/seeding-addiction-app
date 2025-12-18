import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../config/subscriptionPlans';

interface SubscriptionState {
  // State
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;

  // Subscription details
  selectedPlan: SubscriptionPlan | null;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;

  // Mock mode for development
  mockPremiumEnabled: boolean;

  // Actions
  initialize: () => Promise<void>;
  checkPremiumStatus: () => Promise<void>;
  getPlans: () => SubscriptionPlan[];
  purchasePlan: (plan: SubscriptionPlan) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  toggleMockPremium: () => void;
  cancelSubscription: () => void;
  logout: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      isLoading: false,
      error: null,
      selectedPlan: null,
      expirationDate: null,
      willRenew: false,
      productIdentifier: null,
      mockPremiumEnabled: false,

      // Initialize subscription state
      initialize: async () => {
        set({ isLoading: true, error: null });

        try {
          // In mock mode, just check the stored premium state
          await get().checkPremiumStatus();
          console.log('[SubscriptionStore] Initialized (mock mode)');
        } catch (error: any) {
          console.error('[SubscriptionStore] Initialize error:', error);
          set({ error: error.message || 'Failed to initialize subscriptions' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Check if user has premium access
      checkPremiumStatus: async () => {
        const { mockPremiumEnabled, expirationDate } = get();

        // Check if subscription has expired
        if (expirationDate) {
          const expDate = new Date(expirationDate);
          if (expDate < new Date()) {
            // Subscription expired
            set({
              isPremium: false,
              expirationDate: null,
              willRenew: false,
              selectedPlan: null,
              productIdentifier: null,
            });
            return;
          }
        }

        set({ isPremium: mockPremiumEnabled });
      },

      // Get available plans
      getPlans: () => {
        return SUBSCRIPTION_PLANS;
      },

      // Purchase a plan (mock implementation)
      purchasePlan: async (plan: SubscriptionPlan) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate purchase delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Calculate expiration date based on plan period
          let expirationDate: string | null = null;
          const now = new Date();

          switch (plan.period) {
            case 'weekly':
              expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
              break;
            case 'monthly':
              expirationDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
              break;
            case 'yearly':
              expirationDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
              break;
            case 'lifetime':
              // Lifetime = 100 years from now
              expirationDate = new Date(now.setFullYear(now.getFullYear() + 100)).toISOString();
              break;
          }

          set({
            isPremium: true,
            mockPremiumEnabled: true,
            selectedPlan: plan,
            expirationDate,
            willRenew: plan.period !== 'lifetime',
            productIdentifier: plan.id,
          });

          console.log('[SubscriptionStore] Mock purchase successful:', plan.name);
          return true;
        } catch (error: any) {
          console.error('[SubscriptionStore] Purchase error:', error);
          set({ error: error.message || 'Failed to complete purchase' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Restore purchases (mock implementation)
      restorePurchases: async () => {
        set({ isLoading: true, error: null });

        try {
          // Simulate restore delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // In mock mode, just return current state
          const { mockPremiumEnabled } = get();

          if (mockPremiumEnabled) {
            console.log('[SubscriptionStore] Purchases restored');
            return true;
          }

          console.log('[SubscriptionStore] No purchases to restore');
          return false;
        } catch (error: any) {
          console.error('[SubscriptionStore] Restore purchases error:', error);
          set({ error: error.message || 'Failed to restore purchases' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Toggle mock premium status (for development testing)
      toggleMockPremium: () => {
        const { mockPremiumEnabled } = get();
        const newStatus = !mockPremiumEnabled;

        if (newStatus) {
          // Enable premium with monthly plan as default
          const monthlyPlan = SUBSCRIPTION_PLANS.find((p) => p.period === 'monthly');
          const now = new Date();
          const expirationDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

          set({
            isPremium: true,
            mockPremiumEnabled: true,
            selectedPlan: monthlyPlan || null,
            expirationDate,
            willRenew: true,
            productIdentifier: monthlyPlan?.id || null,
          });
        } else {
          // Disable premium
          set({
            isPremium: false,
            mockPremiumEnabled: false,
            selectedPlan: null,
            expirationDate: null,
            willRenew: false,
            productIdentifier: null,
          });
        }

        console.log('[SubscriptionStore] Mock premium toggled:', newStatus);
      },

      // Cancel subscription
      cancelSubscription: () => {
        set({
          willRenew: false,
        });
        console.log('[SubscriptionStore] Subscription cancelled (will not renew)');
      },

      // Logout / reset
      logout: () => {
        set({
          isPremium: false,
          mockPremiumEnabled: false,
          selectedPlan: null,
          expirationDate: null,
          willRenew: false,
          productIdentifier: null,
        });
        console.log('[SubscriptionStore] Logged out');
      },
    }),
    {
      name: 'seeding-subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        mockPremiumEnabled: state.mockPremiumEnabled,
        selectedPlan: state.selectedPlan,
        expirationDate: state.expirationDate,
        willRenew: state.willRenew,
        productIdentifier: state.productIdentifier,
      }),
    }
  )
);
