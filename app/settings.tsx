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
} from '../src/services/security';
import { useRelapseStore } from '../src/stores/relapseStore';

export default function SettingsScreen() {
  const router = useRouter();
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

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-16 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-blue-600 text-lg">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
          <View className="w-16" />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Security Section */}
        <View className="mt-6 px-6">
          <Text className="text-sm text-gray-500 uppercase tracking-wide mb-3">
            Security
          </Text>

          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  App Lock
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {biometricAvailable
                    ? `Protect app with ${authMethodName}`
                    : 'Biometric authentication not available'}
                </Text>
              </View>
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={appLockEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View className="mt-6 px-6">
          <Text className="text-sm text-gray-500 uppercase tracking-wide mb-3">
            Data
          </Text>

          <Pressable
            onPress={handleResetData}
            className="bg-white rounded-xl p-4 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-red-600">
                  Reset All Data
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Permanently delete all records and start fresh
                </Text>
              </View>
              <Text className="text-red-600 text-lg">→</Text>
            </View>
          </Pressable>
        </View>

        {/* App Info */}
        <View className="px-6 pb-8">
          <Text className="text-center text-sm text-gray-400">
            Seeding v1.0.0
          </Text>
          <Text className="text-center text-xs text-gray-400 mt-1">
            Privacy-focused relapse tracking
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
