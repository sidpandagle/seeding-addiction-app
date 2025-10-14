import { View, Text, Pressable, Alert, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  isBiometricAvailable,
  isAppLockEnabled,
  setAppLockEnabled,
  authenticateUser,
  getAuthenticationMethodName,
} from '../../src/services/security';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useColorScheme, useThemeStore } from '../../src/stores/themeStore';
import { Settings2, Palette, Lock, Database, Sun, Moon, Shield, Trash2, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4 bg-purple-50 dark:bg-gray-900">
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
                Settings
              </Text>
              <Text className="mt-1 text-sm font-medium text-purple-700 dark:text-purple-400">
                Customize your experience
              </Text>
            </View>
            <View className="items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
              <Settings2 size={24} color="#a855f7" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Appearance Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Palette size={18} color={colorScheme === 'dark' ? '#a855f7' : '#9333ea'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Appearance
            </Text>
          </View>

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            <Text className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Theme
            </Text>

            {/* Light Theme Option */}
            <Pressable
              onPress={() => useThemeStore.getState().setColorScheme('light')}
              className="flex-row items-center p-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 active:opacity-70"
            >
              <View className="items-center justify-center w-10 h-10 mr-3 bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:border-gray-700">
                <Sun size={20} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                Light Mode
              </Text>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                colorScheme === 'light' ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {colorScheme === 'light' && (
                  <View className="w-3 h-3 rounded-full bg-emerald-500" />
                )}
              </View>
            </Pressable>

            {/* Dark Theme Option */}
            <Pressable
              onPress={() => useThemeStore.getState().setColorScheme('dark')}
              className="flex-row items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 active:opacity-70"
            >
              <View className="items-center justify-center w-10 h-10 mr-3 bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:border-gray-700">
                <Moon size={20} color="#6366f1" strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                Dark Mode
              </Text>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                colorScheme === 'dark' ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {colorScheme === 'dark' && (
                  <View className="w-3 h-3 rounded-full bg-emerald-500" />
                )}
              </View>
            </Pressable>
          </View>
        </View>

        {/* Security Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Shield size={18} color={colorScheme === 'dark' ? '#3b82f6' : '#2563eb'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Security
            </Text>
          </View>

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <Lock size={20} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    App Lock
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {biometricAvailable
                      ? `Protect with ${authMethodName}`
                      : 'Not available'}
                  </Text>
                </View>
              </View>
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={appLockEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Database size={18} color={colorScheme === 'dark' ? '#ef4444' : '#dc2626'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Data Management
            </Text>
          </View>

          <Pressable
            onPress={handleResetData}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-red-50 dark:bg-red-900/30">
                  <Trash2 size={20} color="#ef4444" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-red-600 dark:text-red-400">
                    Reset All Data
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Permanently delete all records
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-medium text-red-600 dark:text-red-400">→</Text>
            </View>
          </Pressable>
        </View>

        {/* App Info */}
        <View className="px-6 mt-8">
          <View className="items-center p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            <View className="items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl">
              <Info size={28} color="#10b981" strokeWidth={2.5} />
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Seeding
            </Text>
            <Text className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </Text>
            <Text className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500">
              Privacy-focused relapse tracking
            </Text>
            <Text className="mt-1 text-xs text-center text-emerald-600 dark:text-emerald-400">
              Your data stays on your device
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
