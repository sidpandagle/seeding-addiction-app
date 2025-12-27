/**
 * RevenueCat Service
 *
 * Wraps RevenueCat SDK with error handling and logging
 * Follows the same pattern as notificationService.ts
 */

import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import {
  getRevenueCatApiKey,
  ENTITLEMENT_ID,
  OFFERING_ID,
} from '../config/revenueCat';

// Service-specific types
export interface SubscriptionInfo {
  isPremium: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;
  customerInfo?: CustomerInfo;
}

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

class RevenueCatService {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize RevenueCat SDK
   * Safe to call multiple times (idempotent)
   */
  async initialize(): Promise<void> {
    // Prevent concurrent initialization
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) {
      console.log('[RevenueCat] Already initialized');
      return Promise.resolve();
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      const apiKey = getRevenueCatApiKey();

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      // Configure SDK
      Purchases.configure({ apiKey });

      // Set log level based on environment
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      } else {
        Purchases.setLogLevel(LOG_LEVEL.INFO);
      }

      // Enable automatic Apple Search Ads attribution (Android also supports)
      if (Platform.OS === 'android') {
        // Android-specific configuration can go here
      }

      this.initialized = true;
      console.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization error:', error);
      this.initializationPromise = null; // Allow retry
      throw error;
    }
  }

  /**
   * Get current subscription status
   * Uses cached CustomerInfo when available
   */
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    try {
      await this.ensureInitialized();

      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      if (!isPremium) {
        return {
          isPremium: false,
          expirationDate: null,
          willRenew: false,
          productIdentifier: null,
          customerInfo,
        };
      }

      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      return {
        isPremium: true,
        expirationDate: entitlement.expirationDate || null,
        willRenew: entitlement.willRenew,
        productIdentifier: entitlement.productIdentifier,
        customerInfo,
      };
    } catch (error) {
      console.error('[RevenueCat] Error getting subscription info:', error);
      // Return safe default on error
      return {
        isPremium: false,
        expirationDate: null,
        willRenew: false,
        productIdentifier: null,
      };
    }
  }

  /**
   * Get available offerings (subscription packages)
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      await this.ensureInitialized();
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        console.warn('[RevenueCat] No current offering available');
        return null;
      }

      return offerings;
    } catch (error) {
      console.error('[RevenueCat] Error getting offerings:', error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    try {
      await this.ensureInitialized();

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      console.log('[RevenueCat] Purchase successful:', pkg.identifier);

      return {
        success: true,
        isPremium,
        customerInfo,
      };
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
        return {
          success: false,
          isPremium: false,
          error: 'Purchase cancelled',
        };
      }

      console.error('[RevenueCat] Purchase error:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<PurchaseResult> {
    try {
      await this.ensureInitialized();

      const customerInfo = await Purchases.restorePurchases();
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      console.log('[RevenueCat] Restore purchases completed');

      return {
        success: true,
        isPremium,
        customerInfo,
      };
    } catch (error: any) {
      console.error('[RevenueCat] Restore purchases error:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Restore failed',
      };
    }
  }

  /**
   * Check if customer has active premium entitlement
   */
  private hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
    );
  }

  /**
   * Ensure SDK is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get customer info (for debugging)
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.ensureInitialized();
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('[RevenueCat] Error getting customer info:', error);
      return null;
    }
  }

  /**
   * Identify user (optional - for analytics)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await this.ensureInitialized();
      await Purchases.logIn(userId);
      console.log('[RevenueCat] User identified:', userId);
    } catch (error) {
      console.error('[RevenueCat] Error identifying user:', error);
    }
  }

  /**
   * Logout user (clears customer info)
   */
  async logout(): Promise<void> {
    try {
      if (this.initialized) {
        await Purchases.logOut();
        console.log('[RevenueCat] User logged out');
      }
    } catch (error) {
      console.error('[RevenueCat] Logout error:', error);
    }
  }

  /**
   * Reset service (for testing)
   */
  async reset(): Promise<void> {
    await this.logout();
    this.initialized = false;
    this.initializationPromise = null;
  }
}

export const revenueCatService = new RevenueCatService();
