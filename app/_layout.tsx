import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRelapseStore } from '../src/stores/relapseStore';
import { AppLock } from '../src/components/AppLock';
import { initializeEncryptionKey } from '../src/services/security';
import { initializeDatabase } from '../src/db/schema';
import "../global.css";

export default function RootLayout() {
  const loadRelapses = useRelapseStore((state) => state.loadRelapses);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing app...');

        // Initialize database
        console.log('Initializing database...');
        await initializeDatabase();

        // Initialize encryption key for secure storage
        console.log('Initializing encryption key...');
        await initializeEncryptionKey();

        // Load relapses from database
        console.log('Loading relapses...');
        await loadRelapses();

        console.log('Initialization complete');
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

  if (!isReady) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-2xl font-bold text-red-600 mb-2">Error</Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <AppLock>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="relapses" />
        <Stack.Screen name="settings" />
      </Stack>
    </AppLock>
  );
}
