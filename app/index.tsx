import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { getJourneyStart } from '../src/db/helpers';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkJourneyStatus = async () => {
      try {
        const journeyStart = await getJourneyStart();

        if (journeyStart) {
          // Journey already started - go to dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          // No journey yet - show onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Failed to check journey status:', error);
        // On error, default to onboarding
        router.replace('/onboarding');
      }
    };

    checkJourneyStatus();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
