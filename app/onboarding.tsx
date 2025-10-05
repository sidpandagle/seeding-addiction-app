import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setJourneyStart, getJourneyStart } from '../src/db/helpers';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Check if journey has already started
      const existingJourneyStart = await getJourneyStart();

      if (!existingJourneyStart) {
        // First time user - set journey start timestamp
        await setJourneyStart(new Date().toISOString());
      }

      // Navigate to home
      router.replace('/home');
    } catch (error) {
      console.error('Failed to start journey:', error);
      // Still navigate even if there's an error
      router.replace('/home');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="items-center justify-center flex-1 px-8">
        <Text className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to Seeding
        </Text>
        <Text className="mb-2 text-lg text-center text-gray-600">
          A privacy-focused relapse tracking app
        </Text>

        <Pressable
          onPress={handleGetStarted}
          className="px-8 py-4 mt-12 bg-blue-600 rounded-full active:bg-blue-700"
        >
          <Text className="text-lg font-semibold text-white">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
