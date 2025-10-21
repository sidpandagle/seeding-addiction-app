import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { setJourneyStart, getJourneyStart } from '../src/db/helpers';
import { useColorScheme } from '../src/stores/themeStore';
import { Shield, Lock, TrendingUp, Heart, Sparkles, ChevronRight } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Check if journey has already started
      const existingJourneyStart = await getJourneyStart();

      if (!existingJourneyStart) {
        // First time user - set journey start timestamp
        await setJourneyStart(new Date().toISOString());
      }

      // Wait a small amount to ensure database transaction is complete
      // This prevents race conditions with the home screen loading
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to start journey:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)/home');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      color: '#3b82f6',
      bgColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
      title: 'Track Your Journey',
      description: 'Monitor your progress with real-time tracking and growth milestones'
    },
    {
      icon: Lock,
      color: '#8b5cf6',
      bgColor: colorScheme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
      title: 'Complete Privacy',
      description: 'All your data stays on your device. No cloud, no tracking'
    },
    {
      icon: TrendingUp,
      color: '#10b981',
      bgColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
      title: 'Insights & Analytics',
      description: 'Understand patterns and celebrate achievements along the way'
    },
    {
      icon: Heart,
      color: '#ef4444',
      bgColor: colorScheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      title: 'Emergency Support',
      description: 'Access helpful resources when you need them most'
    }
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Hero Section */}
        <View className="px-6 pt-20 pb-8">
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            className="items-center mb-8"
          >
            <View className="items-center justify-center mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 w-28 h-28 rounded-3xl">
              <Sparkles size={48} color="#10b981" strokeWidth={2.5} />
            </View>

            <Text className="mb-4 text-5xl font-bold text-center text-gray-900 dark:text-white">
              Welcome to{'\n'}Seeding
            </Text>

            <Text className="text-lg text-center font-regular text-emerald-700 dark:text-emerald-400">
              Your personal growth companion
            </Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.duration(600).delay(200)}
            className="mb-8 text-base text-center font-regular text-gray-600 dark:text-gray-400"
          >
            Begin your journey of self-improvement with privacy-focused tracking and meaningful insights
          </Animated.Text>
        </View>

        {/* Features Grid */}
        <View className="px-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.duration(500).delay(300 + index * 100)}
                style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
                className="p-5 mb-4 border border-white dark:border-gray-900 rounded-2xl"
              >
                <View className="flex-row items-start">
                  <View
                    style={{ backgroundColor: feature.bgColor }}
                    className="items-center justify-center w-12 h-12 mr-4 rounded-xl"
                  >
                    <Icon size={24} color={feature.color} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </Text>
                    <Text className="text-sm font-regular text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* CTA Button */}
        <View className="px-6">
          <AnimatedPressable
            entering={FadeInUp.duration(600).delay(700)}
            onPress={handleGetStarted}
            disabled={isLoading}
            className="flex-row items-center justify-center w-full py-5 shadow-lg bg-emerald-600 dark:bg-emerald-700 rounded-2xl active:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="mr-2 text-lg font-bold text-white">
                  Start Your Journey
                </Text>
                <ChevronRight size={24} color="#ffffff" strokeWidth={2.5} />
              </>
            )}
          </AnimatedPressable>

          <Animated.Text
            entering={FadeInUp.duration(600).delay(800)}
            className="mt-6 text-sm text-center font-regular text-gray-500 dark:text-gray-500"
          >
            Your data stays secure on your device.{'\n'}No account required.
          </Animated.Text>
        </View>
      </ScrollView>
    </View>
  );
}
