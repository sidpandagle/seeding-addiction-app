import { Linking, Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';

const ANDROID_PACKAGE = 'com.seeding.app';

async function tryOpen(url: string): Promise<boolean> {
  try {
    // No canOpenURL check: on Android 11+ it reports false for market:// without a <queries> entry
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lets the user rate the app from the "Rate This App" button.
 *
 * Android opens the Play listing directly. The in-app review sheet rejects on builds that
 * weren't installed from Google Play and is quota-limited, so it can show nothing at all,
 * which is a poor fit for a button the user just tapped.
 * iOS tries the native review sheet first, then the App Store link from the app config.
 *
 * @returns false when nothing could be opened. Never throws.
 */
export async function rateApp(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return (
      (await tryOpen(`market://details?id=${ANDROID_PACKAGE}`)) ||
      (await tryOpen(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`))
    );
  }

  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      return true;
    }
  } catch {
    // Not installed from the App Store: fall through to the store link
  }

  const url = StoreReview.storeUrl();
  if (!url) return false;
  return tryOpen(`${url}${url.includes('?') ? '&' : '?'}action=write-review`);
}
