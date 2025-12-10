import { create } from 'zustand';
import {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { revenueCatService } from '../services/revenueCatService';

interface SubscriptionState {
  // State
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  error: string | null;

  // Subscription details
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;

  // Actions
  initialize: () => Promise<void>;
  checkPremiumStatus: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  isPremium: false,
  isLoading: false,
  customerInfo: null,
  offerings: null,
  error: null,
  expirationDate: null,
  willRenew: false,
  productIdentifier: null,

  // Initialize RevenueCat and check status
  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      await revenueCatService.initialize();
      await get().checkPremiumStatus();
      await get().loadOfferings();
    } catch (error: any) {
      console.error('[SubscriptionStore] Initialize error:', error);
      set({ error: error.message || 'Failed to initialize subscriptions' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Check if user has premium access
  checkPremiumStatus: async () => {
    try {
      const subscriptionInfo = await revenueCatService.getSubscriptionInfo();

      set({
        isPremium: subscriptionInfo.isPremium,
        expirationDate: subscriptionInfo.expirationDate || null,
        willRenew: subscriptionInfo.willRenew || false,
        productIdentifier: subscriptionInfo.productIdentifier || null,
      });
    } catch (error: any) {
      console.error('[SubscriptionStore] Check premium status error:', error);
      set({ error: error.message || 'Failed to check premium status' });
    }
  },

  // Load available offerings
  loadOfferings: async () => {
    set({ isLoading: true, error: null });

    try {
      const offerings = await revenueCatService.getOfferings();
      set({ offerings });
    } catch (error: any) {
      console.error('[SubscriptionStore] Load offerings error:', error);
      set({ error: error.message || 'Failed to load offerings' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Purchase a package
  purchasePackage: async (pkg: PurchasesPackage) => {
    set({ isLoading: true, error: null });

    try {
      const result = await revenueCatService.purchasePackage(pkg);

      set({
        isPremium: result.isPremium,
        customerInfo: result.customerInfo,
      });

      // Refresh subscription info
      await get().checkPremiumStatus();

      return result.isPremium;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('[SubscriptionStore] Purchase error:', error);
        set({
          error: error.message || 'Failed to complete purchase',
        });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Restore previous purchases
  restorePurchases: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await revenueCatService.restorePurchases();

      set({
        isPremium: result.isPremium,
        customerInfo: result.customerInfo,
      });

      // Refresh subscription info
      await get().checkPremiumStatus();

      return result.isPremium;
    } catch (error: any) {
      console.error('[SubscriptionStore] Restore purchases error:', error);
      set({ error: error.message || 'Failed to restore purchases' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Refresh customer info
  refreshCustomerInfo: async () => {
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      set({ customerInfo });
      await get().checkPremiumStatus();
    } catch (error: any) {
      console.error('[SubscriptionStore] Refresh customer info error:', error);
      set({ error: error.message || 'Failed to refresh customer info' });
    }
  },

  // Set user ID
  setUserId: async (userId: string) => {
    try {
      await revenueCatService.setUserId(userId);
      await get().refreshCustomerInfo();
    } catch (error: any) {
      console.error('[SubscriptionStore] Set user ID error:', error);
      set({ error: error.message || 'Failed to set user ID' });
    }
  },

  // Logout
  logout: async () => {
    try {
      await revenueCatService.logout();
      set({
        isPremium: false,
        customerInfo: null,
        expirationDate: null,
        willRenew: false,
        productIdentifier: null,
      });
    } catch (error: any) {
      console.error('[SubscriptionStore] Logout error:', error);
      set({ error: error.message || 'Failed to logout' });
    }
  },
}));
