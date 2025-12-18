import { View, Text, Pressable, ScrollView, Switch, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  isBiometricAvailable,
  isAppLockEnabled,
  setAppLockEnabled,
  authenticateUser,
  getAuthenticationMethodName,
} from '../../src/services/security';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useColorScheme, useThemeStore } from '../../src/stores/themeStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { usePremium } from '../../src/hooks/usePremium';
import { Settings2, Palette, Lock, Database, Sun, Moon, Shield, Trash2, Info, Brain, Coffee, BookOpen, Crown, Star, Bell, Clock, Sparkles, Trophy, Download, FileText } from 'lucide-react-native';
import { exportService } from '../../src/services/exportService';
import RecoveryEducationModal from '../../src/components/modals/RecoveryEducationModal';
import CustomAlert from '../../src/components/common/CustomAlert';
import ConfirmationDialog from '../../src/components/common/ConfirmationDialog';
import { useAlert } from '../../src/hooks/useAlert';
import HowToUseModal from '../../src/components/modals/HowToUseModal';
import AboutModal from '../../src/components/modals/AboutModal';
import { PaywallModal } from '../../src/components/premium/PaywallModal';
import { CustomerCenter } from '../../src/components/premium/CustomerCenter';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const resetAllData = useRelapseStore((state) => state.resetAllData);
  const { isPremium, expirationDate, willRenew } = usePremium();
  const [appLockEnabled, setAppLockEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authMethodName, setAuthMethodName] = useState('Biometric');
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Notification state
  const {
    isInitialized: notificationsInitialized,
    isEnabled: notificationsEnabled,
    dailyReminderTime,
    randomNotificationsEnabled,
    milestoneNotificationsEnabled,
    initialize: initializeNotifications,
    setEnabled: setNotificationsEnabled,
    setDailyReminder,
    clearDailyReminder,
    setRandomNotifications,
    setMilestoneNotifications,
  } = useNotificationStore();

  // Alert state
  const { alertState, showAlert, hideAlert } = useAlert();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Animation values for theme buttons
  const lightButtonScale = useSharedValue(1);
  const darkButtonScale = useSharedValue(1);

  // Animated styles for theme buttons
  const lightButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lightButtonScale.value }],
  }));

  const darkButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: darkButtonScale.value }],
  }));

  // Handle theme change with haptic feedback and animation
  const handleThemeChange = (theme: 'light' | 'dark') => {
    // Immediate haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale animation on pressed button
    const scaleValue = theme === 'light' ? lightButtonScale : darkButtonScale;
    scaleValue.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scaleValue.value = withSpring(1, { damping: 10, stiffness: 200 });
    });

    // Change theme (triggers transition overlay)
    useThemeStore.getState().setColorScheme(theme);
  };

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
    initializeNotifications();
  }, []);

  const handleAppLockToggle = async (value: boolean) => {
    try {
      if (value) {
        // Enabling lock - verify biometric is available
        if (!biometricAvailable) {
          showAlert({
            type: 'info',
            title: 'Biometric Not Available',
            message: 'Your device does not have biometric authentication set up. Please enable Face ID, Touch ID, or fingerprint authentication in your device settings.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
            dismissOnBackdrop: true,
          });
          return;
        }

        // Ask user to authenticate before enabling
        const authenticated = await authenticateUser('Authenticate to enable app lock');
        if (!authenticated) {
          showAlert({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Could not enable app lock.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
          });
          return;
        }

        await setAppLockEnabled(true);
        setAppLockEnabledState(true);
        showAlert({
          type: 'success',
          title: 'App Lock Enabled',
          message: `${authMethodName} protection is now active. You'll need to authenticate when opening the app.`,
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      } else {
        // Disabling lock - require authentication first
        const authenticated = await authenticateUser('Authenticate to disable app lock');
        if (!authenticated) {
          showAlert({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Could not disable app lock.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
          });
          return;
        }

        await setAppLockEnabled(false);
        setAppLockEnabledState(false);
        showAlert({
          type: 'success',
          title: 'App Lock Disabled',
          message: 'App lock has been turned off.',
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      }
    } catch (error) {
      console.error('Error toggling app lock:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not update app lock setting.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleResetData = () => {
    setShowConfirmDialog(true);
  };

  const confirmResetData = async () => {
    try {
      // Reset database
      await resetAllData();
      setShowConfirmDialog(false);
      router.replace('/');
    } catch (error) {
      console.error('Error resetting data:', error);
      setShowConfirmDialog(false);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not reset data. Please try again.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleBuyMeCoffee = async () => {
    const url = 'https://buymeacoffee.com/sidp'; // Replace with your actual Buy Me a Coffee URL

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Unable to open link. Please try again later.',
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      }
    } catch (error) {
      console.error('Error opening Buy Me a Coffee:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not open support page.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await setNotificationsEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    if (value) {
      setShowTimePicker(true);
    } else {
      await clearDailyReminder();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTimeSelected = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      await setDailyReminder(hour, minute);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRandomNotificationsToggle = async (value: boolean) => {
    await setRandomNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMilestoneNotificationsToggle = async (value: boolean) => {
    await setMilestoneNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatReminderTime = (time: { hour: number; minute: number } | null) => {
    if (!time) return 'Not set';
    const period = time.hour >= 12 ? 'PM' : 'AM';
    const displayHour = time.hour % 12 || 12;
    const displayMinute = time.minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleExportCSV = async () => {
    if (!isPremium) {
      setShowPaywallModal(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await exportService.exportToCSV();

    if (success) {
      showAlert({
        type: 'success',
        title: 'Export Ready',
        message: 'Your journey data has been exported successfully.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    } else {
      showAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export your data. Please try again.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleExportReport = async () => {
    if (!isPremium) {
      setShowPaywallModal(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await exportService.exportToText();

    if (success) {
      showAlert({
        type: 'success',
        title: 'Report Ready',
        message: 'Your journey report has been generated.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    } else {
      showAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate report. Please try again.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };


  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-6">
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                Settings
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-purple-700 dark:text-purple-400">
                Customize your experience
              </Text>
            </View>
            <View className="items-center justify-center bg-purple-100 w-14 h-14 dark:bg-purple-900/30 rounded-2xl">
              <Settings2 size={26} color="#a855f7" strokeWidth={2.5} />
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

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            <Text className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Theme
            </Text>

            {/* Light Theme Option */}
            <Animated.View style={lightButtonStyle}>
              <Pressable
                onPress={() => handleThemeChange('light')}
                className="flex-row items-center p-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <View className="items-center justify-center w-10 h-10 mr-3 bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:border-gray-700">
                  <Sun size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                  Light Mode
                </Text>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${colorScheme === 'light' ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                  {colorScheme === 'light' && (
                    <View className="w-3 h-3 rounded-full bg-emerald-500" />
                  )}
                </View>
              </Pressable>
            </Animated.View>

            {/* Dark Theme Option */}
            <Animated.View style={darkButtonStyle}>
              <Pressable
                onPress={() => handleThemeChange('dark')}
                className="flex-row items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <View className="items-center justify-center w-10 h-10 mr-3 bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:border-gray-700">
                  <Moon size={20} color="#6366f1" strokeWidth={2.5} />
                </View>
                <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                  Dark Mode
                </Text>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${colorScheme === 'dark' ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                  {colorScheme === 'dark' && (
                    <View className="w-3 h-3 rounded-full bg-emerald-500" />
                  )}
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Premium Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Crown size={18} color={colorScheme === 'dark' ? '#fbbf24' : '#f59e0b'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Premium
            </Text>
          </View>

          {isPremium ? (
            <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <View className="flex-row items-center mb-4">
                <View className="items-center justify-center w-12 h-12 mr-3 bg-purple-100 rounded-full dark:bg-purple-900/30">
                  <Star size={24} color="#a855f7" fill="#a855f7" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold dark:text-white">
                    Seeding Pro
                  </Text>
                  <Text className="text-sm text-purple-900 dark:text-purple-100">
                    Active subscription
                  </Text>
                </View>
              </View>

              {expirationDate && (
                <View className="p-3 mb-3 rounded-xl">
                  <Text className="text-xs font-semibold dark:text-purple-100">
                    {willRenew ? 'Renews on' : 'Expires on'}
                  </Text>
                  <Text className="mt-1 text-sm font-bold dark:text-white">
                    {new Date(expirationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => setShowCustomerCenter(true)}
                className="p-3 bg-purple-100 rounded-xl dark:bg-purple-900/20 active:opacity-70"
              >
                <Text className="font-semibold text-center text-purple-600 dark:text-purple-400">
                  Manage Subscription
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowPaywallModal(true)}
              className="p-5 overflow-hidden bg-white border border-white dark:bg-gray-900 dark:border-gray-900 rounded-2xl active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                    <Crown size={20} color="#f59e0b" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                      Upgrade to Pro
                    </Text>
                    <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      Unlock all premium features
                    </Text>
                  </View>
                </View>
                <Text className="text-xl font-medium text-amber-600 dark:text-amber-400">→</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Notifications Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell size={18} color={colorScheme === 'dark' ? '#10b981' : '#059669'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Notifications
            </Text>
          </View>

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            {/* Master Toggle */}
            <View className="flex-row items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                  <Bell size={20} color="#10b981" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Enable Notifications
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {notificationsInitialized ? 'Reminders & motivation' : 'Setting up...'}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                disabled={!notificationsInitialized}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Daily Reminder */}
            <View className={`flex-row items-center justify-between py-3 ${!notificationsEnabled ? 'opacity-50' : ''}`}>
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <Clock size={20} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Daily Reminder
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {formatReminderTime(dailyReminderTime)}
                  </Text>
                </View>
              </View>
              <Switch
                value={!!dailyReminderTime}
                onValueChange={handleDailyReminderToggle}
                disabled={!notificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={dailyReminderTime ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Random Motivation */}
            <View className={`flex-row items-center justify-between py-3 ${!notificationsEnabled ? 'opacity-50' : ''}`}>
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-50 dark:bg-purple-900/30">
                  <Sparkles size={20} color="#a855f7" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Random Motivation
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Encouraging messages throughout the day
                  </Text>
                </View>
              </View>
              <Switch
                value={randomNotificationsEnabled}
                onValueChange={handleRandomNotificationsToggle}
                disabled={!notificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#a855f7' }}
                thumbColor={randomNotificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Milestone Alerts */}
            <View className={`flex-row items-center justify-between py-3 ${!notificationsEnabled ? 'opacity-50' : ''}`}>
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Milestone Alerts
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Get notified when you're close to achievements
                  </Text>
                </View>
              </View>
              <Switch
                value={milestoneNotificationsEnabled}
                onValueChange={handleMilestoneNotificationsToggle}
                disabled={!notificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                thumbColor={milestoneNotificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>
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

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
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

        {/* How to Use Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <BookOpen size={18} color={colorScheme === 'dark' ? '#10b981' : '#059669'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Guide
            </Text>
          </View>

          <Pressable
            onPress={() => setShowHowToUseModal(true)}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                  <BookOpen size={20} color="#10b981" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    How to Use This App
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Learn about features & tracking
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-medium text-emerald-600 dark:text-emerald-400">→</Text>
            </View>
          </Pressable>
        </View>

        {/* Education Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Brain size={18} color={colorScheme === 'dark' ? '#a855f7' : '#9333ea'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Education
            </Text>
          </View>

          <Pressable
            onPress={() => setShowEducationModal(true)}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-50 dark:bg-purple-900/30">
                  <Brain size={20} color="#a855f7" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Understanding Recovery
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Learn about dopamine science
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-medium text-purple-600 dark:text-purple-400">→</Text>
            </View>
          </Pressable>
        </View>



        {/* Export Section (Pro) */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Download size={18} color={colorScheme === 'dark' ? '#3b82f6' : '#2563eb'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Export Data
            </Text>
            {!isPremium && (
              <View className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Text className="text-xs font-semibold text-purple-700 dark:text-purple-300">PRO</Text>
              </View>
            )}
          </View>

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            {/* CSV Export */}
            <Pressable
              onPress={handleExportCSV}
              className="flex-row items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800 active:opacity-70"
            >
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <Download size={20} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Export to CSV
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Full data for spreadsheets
                  </Text>
                </View>
              </View>
              {!isPremium && <Lock size={18} color="#9CA3AF" strokeWidth={2.5} />}
            </Pressable>

            {/* Report Export */}
            <Pressable
              onPress={handleExportReport}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-green-50 dark:bg-green-900/30">
                  <FileText size={20} color="#10b981" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Share Report
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Formatted summary for therapy
                  </Text>
                </View>
              </View>
              {!isPremium && <Lock size={18} color="#9CA3AF" strokeWidth={2.5} />}
            </Pressable>
          </View>
        </View>

        {/* Support Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Coffee size={18} color={colorScheme === 'dark' ? '#f59e0b' : '#d97706'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Support
            </Text>
          </View>

          <Pressable
            onPress={handleBuyMeCoffee}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <Coffee size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Buy Me a Coffee
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Support the development
                  </Text>
                </View>
              </View>
              <Text className="text-xl font-medium text-amber-600 dark:text-amber-400">→</Text>
            </View>
          </Pressable>
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
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
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
          <Pressable
            onPress={() => setShowAboutModal(true)}
            className="items-center p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
          >
            <View className="items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl">
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
              Tap to learn more & FAQ
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Recovery Education Modal */}
      <Modal
        visible={showEducationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEducationModal(false)}
      >
        <RecoveryEducationModal onClose={() => setShowEducationModal(false)} />
      </Modal>

      {/* How to Use Modal */}
      <Modal
        visible={showHowToUseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHowToUseModal(false)}
      >
        <HowToUseModal onClose={() => setShowHowToUseModal(false)} />
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <AboutModal onClose={() => setShowAboutModal(false)} />
      </Modal>

      {/* Custom Alert */}
      {alertState && (
        <CustomAlert
          visible={alertState.visible}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onDismiss={hideAlert}
          dismissOnBackdrop={alertState.dismissOnBackdrop}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showConfirmDialog}
        title="Reset All Data"
        message="This will permanently delete all your relapse records and journey start date. This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmResetData}
        onCancel={() => setShowConfirmDialog(false)}
        isDestructive={true}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
      />

      {/* Customer Center */}
      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />

      {/* Time Picker for Daily Reminder */}
      {showTimePicker && (
        <DateTimePicker
          value={dailyReminderTime
            ? new Date(new Date().setHours(dailyReminderTime.hour, dailyReminderTime.minute, 0, 0))
            : new Date(new Date().setHours(9, 0, 0, 0))
          }
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={handleTimeSelected}
        />
      )}
    </View>
  );
}
