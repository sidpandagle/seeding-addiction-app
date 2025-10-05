import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

// Keys for secure storage
const ENCRYPTION_KEY = 'seeding_encryption_key';
const APP_LOCK_ENABLED_KEY = 'seeding_app_lock_enabled';

// Platform-specific storage helpers
const isWeb = Platform.OS === 'web';

const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

/**
 * Generate and store an encryption key for database encryption
 */
export const initializeEncryptionKey = async (): Promise<string> => {
  try {
    // Check if key already exists
    const existingKey = await getItem(ENCRYPTION_KEY);
    if (existingKey) {
      return existingKey;
    }

    // Generate a new random encryption key (256 bits = 32 bytes = 64 hex chars)
    const key = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    // Store it securely
    await setItem(ENCRYPTION_KEY, key);
    return key;
  } catch (error) {
    console.error('Failed to initialize encryption key:', error);
    throw new Error('Could not initialize encryption key');
  }
};

/**
 * Get the stored encryption key
 */
export const getEncryptionKey = async (): Promise<string | null> => {
  try {
    return await getItem(ENCRYPTION_KEY);
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    return null;
  }
};

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (isWeb) return false;

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Get the supported authentication types
 */
export const getSupportedAuthTypes = async (): Promise<number[]> => {
  if (isWeb) return [];

  try {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  } catch (error) {
    console.error('Error getting supported auth types:', error);
    return [];
  }
};

/**
 * Authenticate user with biometrics or passcode
 */
export const authenticateUser = async (
  promptMessage: string = 'Authenticate to access Seeding'
): Promise<boolean> => {
  if (isWeb) return true;

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

/**
 * Check if app lock is enabled
 */
export const isAppLockEnabled = async (): Promise<boolean> => {
  try {
    const value = await getItem(APP_LOCK_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking app lock status:', error);
    return false;
  }
};

/**
 * Enable or disable app lock
 */
export const setAppLockEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await setItem(APP_LOCK_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting app lock status:', error);
    throw new Error('Could not update app lock setting');
  }
};

/**
 * Get human-readable authentication method name
 */
export const getAuthenticationMethodName = async (): Promise<string> => {
  const types = await getSupportedAuthTypes();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }

  return 'Biometric';
};
