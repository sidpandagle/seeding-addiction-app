import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRelapseStore } from '../src/stores/relapseStore';
import { useThemeStore } from '../src/stores/themeStore';
import { AppLock } from '../src/components/AppLock';
import { initializeEncryptionKey } from '../src/services/security';
import { initializeDatabase } from '../src/db/schema';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useColorScheme } from 'nativewind';
import "../global.css";

export default function RootLayout() {
  const loadRelapses = useRelapseStore((state) => state.loadRelapses);
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Sync theme with NativeWind
  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    const initialize = async () => {
      try {

        // Initialize database
        await initializeDatabase();

        // Initialize encryption key for secure storage
        await initializeEncryptionKey();

        // Load relapses from database
        await loadRelapses();

        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
        // Still set ready to true to show error screen instead of hanging
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!fontsLoaded || !isReady) {
    return (
      <View className="items-center justify-center flex-1 bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text className="mt-4 text-gray-600 font-regular dark:text-gray-300">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white dark:bg-gray-900">
        <Text className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">Error</Text>
        <Text className="text-center text-gray-600 font-regular dark:text-gray-300">{error}</Text>
      </View>
    );
  }

  return (
    <AppLock>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="emergency-help"
          options={{
            animation: 'none',
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }
          }}
        />
        <Stack.Screen
          name="insights"
          options={{
            animation: 'none',
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#111827' : '#f9fafb' }
          }}
        />
      </Stack>
    </AppLock>
  );
}
