import Constants from 'expo-constants';

/** Version from app.json, so Settings and About never drift from the real build */
export const APP_VERSION = Constants.expoConfig?.version ?? '';
