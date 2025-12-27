import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../config/subscriptionPlans';
import { revenueCatService } from '../services/revenueCatService';
import type { PurchasesPackage } from 'react-native-purchases';

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

  // RevenueCat state
  packages: PurchasesPackage[] | null;
  lastSyncTime: number | null;

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
      packages: null,
      lastSyncTime: null,
      mockPremiumEnabled: false,

      // Initialize subscription state
      initialize: async () => {
        set({ isLoading: true, error: null });

        try {
          const { mockPremiumEnabled } = get();

          // If mock mode is enabled, skip RevenueCat initialization
          if (mockPremiumEnabled) {
            await get().checkPremiumStatus();
            console.log('[SubscriptionStore] Initialized (mock mode)');
            set({ isLoading: false });
            return;
          }

          // Initialize RevenueCat SDK
          await revenueCatService.initialize();

          // Fetch current subscription status
          const info = await revenueCatService.getSubscriptionInfo();

          // Fetch available offerings
          const offerings = await revenueCatService.getOfferings();
          const packages = offerings?.current?.availablePackages || null;

          // Map productIdentifier to SubscriptionPlan
          let selectedPlan: SubscriptionPlan | null = null;
          if (info.productIdentifier) {
            selectedPlan =
              SUBSCRIPTION_PLANS.find((p) => p.id === info.productIdentifier) ||
              null;
          }

          set({
            isPremium: info.isPremium,
            expirationDate: info.expirationDate,
            willRenew: info.willRenew,
            productIdentifier: info.productIdentifier,
            selectedPlan,
            packages,
            lastSyncTime: Date.now(),
          });

          console.log('[SubscriptionStore] Initialized with RevenueCat');
        } catch (error: any) {
          console.error('[SubscriptionStore] Initialize error:', error);
          set({ error: error.message || 'Failed to initialize subscriptions' });

          // Fallback to mock mode on error
          await get().checkPremiumStatus();
        } finally {
          set({ isLoading: false });
        }
      },

      // Check if user has premium access
      checkPremiumStatus: async () => {
        const { mockPremiumEnabled } = get();

        // If in mock mode, use local expiration checking
        if (mockPremiumEnabled) {
          const { expirationDate } = get();

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
          return;
        }

        // Use RevenueCat to check premium status
        try {
          const info = await revenueCatService.getSubscriptionInfo();

          // Map productIdentifier to SubscriptionPlan
          let selectedPlan: SubscriptionPlan | null = null;
          if (info.productIdentifier) {
            selectedPlan =
              SUBSCRIPTION_PLANS.find((p) => p.id === info.productIdentifier) ||
              null;
          }

          set({
            isPremium: info.isPremium,
            expirationDate: info.expirationDate,
            willRenew: info.willRenew,
            productIdentifier: info.productIdentifier,
            selectedPlan,
            lastSyncTime: Date.now(),
          });
        } catch (error) {
          console.error('[SubscriptionStore] Check premium status error:', error);
          // Keep existing state on error
        }
      },

      // Get available plans
      getPlans: () => {
        return SUBSCRIPTION_PLANS;
      },

      // Purchase a plan
      purchasePlan: async (plan: SubscriptionPlan) => {
        set({ isLoading: true, error: null });

        try {
          const { mockPremiumEnabled, packages } = get();

          // Mock mode purchase (for development)
          if (mockPremiumEnabled || !packages) {
            // Simulate purchase delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Calculate expiration date based on plan period
            let expirationDate: string | null = null;
            const now = new Date();

            switch (plan.period) {
              case 'weekly':
                expirationDate = new Date(
                  now.getTime() + 7 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
              case 'monthly':
                expirationDate = new Date(
                  now.setMonth(now.getMonth() + 1)
                ).toISOString();
                break;
              case 'yearly':
                expirationDate = new Date(
                  now.setFullYear(now.getFullYear() + 1)
                ).toISOString();
                break;
              case 'lifetime':
                // Lifetime = 100 years from now
                expirationDate = new Date(
                  now.setFullYear(now.getFullYear() + 100)
                ).toISOString();
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
          }

          // Real RevenueCat purchase
          // Find matching package by product ID
          const pkg = packages.find((p) => p.product.identifier === plan.id);

          if (!pkg) {
            throw new Error(`Package not found for ${plan.id}`);
          }

          // Attempt purchase
          const result = await revenueCatService.purchasePackage(pkg);

          if (!result.success) {
            throw new Error(result.error || 'Purchase failed');
          }

          // Update state with new subscription info
          const info = await revenueCatService.getSubscriptionInfo();

          set({
            isPremium: info.isPremium,
            expirationDate: info.expirationDate,
            willRenew: info.willRenew,
            productIdentifier: info.productIdentifier,
            selectedPlan: plan,
            lastSyncTime: Date.now(),
          });

          console.log('[SubscriptionStore] Purchase successful:', plan.name);
          return true;
        } catch (error: any) {
          console.error('[SubscriptionStore] Purchase error:', error);
          set({ error: error.message || 'Failed to complete purchase' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Restore purchases
      restorePurchases: async () => {
        set({ isLoading: true, error: null });

        try {
          const { mockPremiumEnabled } = get();

          // Mock mode restore (for development)
          if (mockPremiumEnabled) {
            // Simulate restore delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log('[SubscriptionStore] Purchases restored (mock)');
            return mockPremiumEnabled;
          }

          // Real RevenueCat restore
          const result = await revenueCatService.restorePurchases();

          if (!result.success) {
            throw new Error(result.error || 'Restore failed');
          }

          // Update state
          const info = await revenueCatService.getSubscriptionInfo();

          let selectedPlan: SubscriptionPlan | null = null;
          if (info.productIdentifier) {
            selectedPlan =
              SUBSCRIPTION_PLANS.find((p) => p.id === info.productIdentifier) ||
              null;
          }

          set({
            isPremium: info.isPremium,
            expirationDate: info.expirationDate,
            willRenew: info.willRenew,
            productIdentifier: info.productIdentifier,
            selectedPlan,
            lastSyncTime: Date.now(),
          });

          console.log('[SubscriptionStore] Purchases restored');
          return result.isPremium;
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
        revenueCatService.logout();
        set({
          isPremium: false,
          mockPremiumEnabled: false,
          selectedPlan: null,
          expirationDate: null,
          willRenew: false,
          productIdentifier: null,
          packages: null,
          lastSyncTime: null,
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
        lastSyncTime: state.lastSyncTime,
        // Note: packages are not persisted - they're fetched on each init
      }),
    }
  )
);
