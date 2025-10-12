import { View, Text, Pressable, Alert, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  isBiometricAvailable,
  isAppLockEnabled,
  setAppLockEnabled,
  authenticateUser,
  getAuthenticationMethodName,
} from '../../src/services/security';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const resetAllData = useRelapseStore((state) => state.resetAllData);
  const [appLockEnabled, setAppLockEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authMethodName, setAuthMethodName] = useState('Biometric');

  useEffect(() => {
    const loadSecuritySettings = async () => {
      const lockEnabled = await isAppLockEnabled();
      const bioAvailable = await isBiometricAvailable();
      const methodName = await getAuthenticationMethodName();

      setAppLockEnabledState(lockEnabled);
      setBiometricAvailable(bioAvailable);
      setAuthMethodName(methodName);
    };

    loadSecuritySettings();
  }, []);

  const handleAppLockToggle = async (value: boolean) => {
    try {
      if (value) {
        // Enabling lock - verify biometric is available
        if (!biometricAvailable) {
          Alert.alert(
            'Biometric Not Available',
            'Your device does not have biometric authentication set up. Please enable Face ID, Touch ID, or fingerprint authentication in your device settings.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Ask user to authenticate before enabling
        const authenticated = await authenticateUser('Authenticate to enable app lock');
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Could not enable app lock.');
          return;
        }

        await setAppLockEnabled(true);
        setAppLockEnabledState(true);
        Alert.alert(
          'App Lock Enabled',
          `${authMethodName} protection is now active. You'll need to authenticate when opening the app.`,
          [{ text: 'OK' }]
        );
      } else {
        // Disabling lock - require authentication first
        const authenticated = await authenticateUser('Authenticate to disable app lock');
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Could not disable app lock.');
          return;
        }

        await setAppLockEnabled(false);
        setAppLockEnabledState(false);
        Alert.alert('App Lock Disabled', 'App lock has been turned off.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error toggling app lock:', error);
      Alert.alert('Error', 'Could not update app lock setting.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your relapse records and journey start date. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              router.replace('/');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Could not reset data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-[#1A1825]">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Minimal Header */}
      <View className="bg-white dark:bg-[#252336] pt-16 pb-6 px-6">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Settings
        </Text>
        <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Customize your experience
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View className="mt-6 px-6">
          <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Appearance
          </Text>

          <View className="bg-white dark:bg-[#252336] rounded-2xl p-5 mb-4">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
              Theme
            </Text>

            {/* Light Theme Option */}
            <Pressable
              onPress={() => useThemeStore.getState().setColorScheme('light')}
              className="flex-row items-center py-3 active:opacity-70"
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                colorScheme === 'light' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}>
                {colorScheme === 'light' && (
                  <View className="w-3 h-3 rounded-full bg-primary-500" />
                )}
              </View>
              <Text className="text-base text-neutral-800 dark:text-neutral-200">
                Light
              </Text>
            </Pressable>

            {/* Dark Theme Option */}
            <Pressable
              onPress={() => useThemeStore.getState().setColorScheme('dark')}
              className="flex-row items-center py-3 active:opacity-70"
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                colorScheme === 'dark' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}>
                {colorScheme === 'dark' && (
                  <View className="w-3 h-3 rounded-full bg-primary-500" />
                )}
              </View>
              <Text className="text-base text-neutral-800 dark:text-neutral-200">
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Security Section */}
        <View className="mt-4 px-6">
          <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Security
          </Text>

          <View className="bg-white dark:bg-[#252336] rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                  App Lock
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {biometricAvailable
                    ? `Protect with ${authMethodName}`
                    : 'Biometric not available'}
                </Text>
              </View>
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: isDark ? '#3D3A52' : '#E0E0E0', true: '#6B9A7F' }}
                thumbColor={appLockEnabled ? '#ffffff' : '#f5f5f5'}
                ios_backgroundColor={isDark ? '#3D3A52' : '#E0E0E0'}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View className="mt-4 px-6">
          <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Data
          </Text>

          <Pressable
            onPress={handleResetData}
            className="bg-white dark:bg-[#252336] rounded-2xl p-5 mb-4 active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-warm-600 dark:text-warm-400">
                  Reset All Data
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Delete all records and start fresh
                </Text>
              </View>
              <Text className="text-warm-600 dark:text-warm-400 text-lg">→</Text>
            </View>
          </Pressable>
        </View>

        {/* App Info */}
        <View className="px-6 pb-12 mt-8">
          <Text className="text-center text-sm text-neutral-400 dark:text-neutral-500">
            Seeding v1.0.0
          </Text>
          <Text className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-2">
            Privacy-focused journey tracking
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
