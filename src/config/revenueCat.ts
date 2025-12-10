/**
 * RevenueCat Configuration
 *
 * IMPORTANT: Replace these API keys with your actual RevenueCat keys
 * Get them from: https://app.revenuecat.com/
 */

export const REVENUECAT_CONFIG = {
  // Test API Key (works for both iOS and Android in sandbox mode)
  // Replace with platform-specific keys for production
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'test_yvSsDIsRBrxnioHuMKnEWHFMIFr',
};

/**
 * Premium entitlement identifier
 * This should match the entitlement ID you set up in RevenueCat dashboard
 */
export const ENTITLEMENT_ID = 'Seeding Pro';

/**
 * Offering identifier
 * This references the offering you configure in RevenueCat dashboard
 */
export const OFFERING_ID = 'default';
