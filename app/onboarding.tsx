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

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to start journey:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)/home');
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-[#1A1825]">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="items-center justify-center flex-1 px-8">
        {/* Decorative Element */}
        <View className="mb-8">
          <Text className="text-6xl text-center">🌱</Text>
        </View>

        {/* Title */}
        <Text className="text-4xl font-semibold text-center text-neutral-900 dark:text-neutral-50 tracking-tight mb-4">
          Welcome to Seeding
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-center text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
          A calm, private space for tracking your journey towards self-discipline and inner peace
        </Text>

        {/* CTA Button */}
        <Pressable
          onPress={handleGetStarted}
          className="px-10 py-4 mt-12 rounded-2xl bg-primary-500 dark:bg-primary-600 active:bg-primary-600 dark:active:bg-primary-700"
        >
          <Text className="text-base font-semibold text-white tracking-wide">
            Begin Your Journey
          </Text>
        </Pressable>

        {/* Footer Note */}
        <Text className="absolute bottom-12 text-xs text-center text-neutral-400 dark:text-neutral-500 px-8">
          All your data stays private on your device
        </Text>
      </View>
    </View>
  );
}
