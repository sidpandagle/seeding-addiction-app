import { Stack } from 'expo-router';
import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import * as Notifications from 'expo-notifications';
import { EventSubscription } from 'expo-modules-core';
import { useRelapseStore } from '../src/stores/relapseStore';
import { useColorScheme as useColorSchemeStore } from '../src/stores/themeStore';
import { useNotificationStore } from '../src/stores/notificationStore';
import { AppLock } from '../src/components/common/AppLock';
import { ThemeTransitionOverlay } from '../src/components/common/ThemeTransitionOverlay';
import { initializeEncryptionKey } from '../src/services/security';
import { initializeDatabase } from '../src/db/schema';
import { initializeNotifications } from '../src/services/notifications';
import { getJourneyStart } from '../src/db/helpers';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useColorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn } from 'react-native-reanimated';
import "../global.css";

// Suppress deprecation warnings from third-party libraries
LogBox.ignoreLogs([
  /SafeAreaView has been deprecated/,
  /setLayoutAnimationEnabledExperimental/,
]);

// Enable native screens for better performance
enableScreens(true);

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadRelapses = useRelapseStore((state) => state.loadRelapses);
  const latestRelapseTimestamp = useRelapseStore((state) => state.latestTimestamp);
  const colorScheme = useColorSchemeStore();
  const { setColorScheme } = useColorScheme();
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const motivationalReminderTime = useNotificationStore((state) => state.motivationalReminderTime);
  const notificationHydrated = useNotificationStore((state) => state._hasHydrated);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Sync theme with NativeWind asynchronously to reduce blocking during theme changes
  // Note: useEffect instead of useLayoutEffect allows UI to update faster
  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Run all initialization tasks in parallel for faster startup
        await Promise.all([
          initializeDatabase(),
          initializeEncryptionKey(),
        ]);

        // Load initial data BEFORE marking as ready to prevent timer glitches
        // This ensures journey start and relapse data are available when home screen renders
        await loadRelapses();

        // Mark as ready after all critical data is loaded
        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
        // Still set ready to true to show error screen instead of hanging
        setIsReady(true);
      }
    };

    initialize();
  }, [loadRelapses]);

  // Initialize notifications after store is hydrated and data is loaded
  useEffect(() => {
    const setupNotifications = async () => {
      if (!notificationHydrated || !isReady) {
        return;
      }

      try {
        // Get journey data
        const journeyStart = await getJourneyStart();

        // Current streak start is either the latest relapse or the journey start
        // This is the absolute timestamp that notifications will be scheduled from
        const currentStreakStart = latestRelapseTimestamp || journeyStart;

        // Initialize notifications with absolute journey start timestamp
        // No need to calculate elapsed time - notification service does this internally
        await initializeNotifications(
          notificationsEnabled,
          currentStreakStart,
          motivationalReminderTime
        );
      } catch (err) {
        console.error('Notification initialization error:', err);
      }
    };

    setupNotifications();
  }, [notificationHydrated, isReady, notificationsEnabled, motivationalReminderTime]);

  // Set up notification listeners for when notifications are tapped
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);

      // Check if it's an achievement notification
      const notificationData = response.notification.request.content.data;
      if (notificationData?.type === 'achievement') {
        console.log('Achievement notification tapped, will be shown on home screen');
        // The achievement will be detected and shown when the home screen loads
        // via the missed achievement detection logic
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Hide splash screen when everything is ready
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && isReady) {
        // Hide splash immediately - no artificial delay
        await SplashScreen.hideAsync();
      }
    };

    hideSplash();
  }, [fontsLoaded, isReady]);

  // Don't render anything until ready - splash screen stays visible
  if (!fontsLoaded || !isReady) {
    return null;
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white dark:bg-gray-900">
        <Animated.Text
          entering={FadeIn.duration(150)}
          className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400"
        >
          Error
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.duration(150).delay(50)}
          className="text-center text-gray-600 font-regular dark:text-gray-300"
        >
          {error}
        </Animated.Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppLock>
        <Animated.View
          entering={FadeIn.duration(150)}
          style={{
            flex: 1,
            backgroundColor: colorScheme === 'dark' ? '#030712' : '#f9fafb'
          }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          {/* Theme transition overlay - masks re-render delay with smooth animation */}
          <ThemeTransitionOverlay />
        </Animated.View>
      </AppLock>
    </SafeAreaProvider>
  );
}
