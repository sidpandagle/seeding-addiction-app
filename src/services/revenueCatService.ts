import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG, ENTITLEMENT_ID } from '../config/revenueCat';

class RevenueCatService {
  private initialized = false;

  /**
   * Initialize RevenueCat SDK
   * Should be called once when the app starts
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      console.log('[RevenueCat] Already initialized');
      return;
    }

    try {
      // Configure SDK
      Purchases.configure({
        apiKey: REVENUECAT_CONFIG.apiKey,
        appUserID: userId,
      });

      // Set log level for debugging (remove in production)
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
      console.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Check if user has premium access
   */
  async isPremium(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.hasPremiumEntitlement(customerInfo);
    } catch (error) {
      console.error('[RevenueCat] Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Get current customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('[RevenueCat] Error getting customer info:', error);
      throw error;
    }
  }

  /**
   * Get available offerings (subscription plans)
   */
  async getOfferings(): Promise<PurchasesOfferings> {
    try {
      return await Purchases.getOfferings();
    } catch (error) {
      console.error('[RevenueCat] Error getting offerings:', error);
      throw error;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{
    customerInfo: CustomerInfo;
    isPremium: boolean;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      return { customerInfo, isPremium };
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
      } else {
        console.error('[RevenueCat] Purchase error:', error);
      }
      throw error;
    }
  }

  /**
   * Restore purchases (for users who already purchased)
   */
  async restorePurchases(): Promise<{
    customerInfo: CustomerInfo;
    isPremium: boolean;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      return { customerInfo, isPremium };
    } catch (error) {
      console.error('[RevenueCat] Restore purchases error:', error);
      throw error;
    }
  }

  /**
   * Check if customer has premium entitlement
   */
  private hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
    );
  }

  /**
   * Get active subscription info
   */
  async getSubscriptionInfo(): Promise<{
    isPremium: boolean;
    expirationDate?: string;
    willRenew?: boolean;
    productIdentifier?: string;
  }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = this.hasPremiumEntitlement(customerInfo);

      if (!isPremium) {
        return { isPremium: false };
      }

      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      return {
        isPremium: true,
        expirationDate: entitlement.expirationDate,
        willRenew: entitlement.willRenew,
        productIdentifier: entitlement.productIdentifier,
      };
    } catch (error) {
      console.error('[RevenueCat] Error getting subscription info:', error);
      return { isPremium: false };
    }
  }

  /**
   * Set user ID for RevenueCat
   */
  async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('[RevenueCat] User logged in:', userId);
    } catch (error) {
      console.error('[RevenueCat] Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Clear user ID (logout)
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('[RevenueCat] User logged out');
    } catch (error) {
      console.error('[RevenueCat] Error logging out:', error);
      throw error;
    }
  }
}

export const revenueCatService = new RevenueCatService();
