import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setJourneyStart, getJourneyStart } from '../src/db/helpers';
import { useThemeStore } from '../src/stores/themeStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((state) => state.colorScheme);

  const handleGetStarted = async () => {
    try {
      // Check if journey has already started
      const existingJourneyStart = await getJourneyStart();

      if (!existingJourneyStart) {
        // First time user - set journey start timestamp
        await setJourneyStart(new Date().toISOString());
      }

      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Failed to start journey:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)/dashboard');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="items-center justify-center flex-1 px-6">
        <Text className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Seeding
        </Text>
        <Text className="mb-2 text-lg font-regular text-center text-gray-600 dark:text-gray-400">
          A privacy-focused relapse tracking app
        </Text>

        <Pressable
          onPress={handleGetStarted}
          className="px-8 py-4 mt-12 bg-emerald-600 dark:bg-emerald-700 rounded-full active:bg-emerald-700 dark:active:bg-emerald-800"
        >
          <Text className="text-lg font-semibold text-white">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
