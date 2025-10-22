import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { useRelapseStore } from '../src/stores/relapseStore';
import { useColorScheme as useColorSchemeStore } from '../src/stores/themeStore';
import { AppLock } from '../src/components/common/AppLock';
import { ThemeTransitionOverlay } from '../src/components/common/ThemeTransitionOverlay';
import { initializeEncryptionKey } from '../src/services/security';
import { initializeDatabase } from '../src/db/schema';
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
  const colorScheme = useColorSchemeStore();
  const { setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
