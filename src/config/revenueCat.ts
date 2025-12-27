/**
 * RevenueCat Configuration
 *
 * Setup Instructions:
 * 1. Create products in Google Play Console
 * 2. Configure products in RevenueCat dashboard
 * 3. Create "Seeding Pro" entitlement in RevenueCat
 * 4. Create "default" offering with 4 packages (weekly, monthly, yearly, lifetime)
 * 5. Update API keys in .env file
 */

import { Platform } from 'react-native';

// Product IDs must match those in Google Play Console
export const PRODUCT_IDS = {
  weekly: 'seeding_pro_weekly',
  monthly: 'seeding_pro_monthly',
  yearly: 'seeding_pro_yearly',
  lifetime: 'seeding_pro_lifetime',
} as const;

// Entitlement identifier (must match RevenueCat dashboard)
export const ENTITLEMENT_ID = 'Seeding Pro';

// Offering identifier
export const OFFERING_ID = 'default';

// API Keys Configuration
export const getRevenueCatApiKey = (): string => {
  // In development, use test key
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';
  }

  // In production, use production keys
  return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_PROD_KEY || '';
};

// Package identifiers for mapping
export const PACKAGE_TYPES = {
  WEEKLY: '$rc_weekly',
  MONTHLY: '$rc_monthly',
  ANNUAL: '$rc_annual',
  LIFETIME: '$rc_lifetime',
} as const;
