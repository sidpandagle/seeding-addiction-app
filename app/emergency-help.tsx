import { View, Text, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../src/stores/themeStore';
import { stoicTeachings, getRandomTeaching, type StoicTeaching } from '../src/data/stoicTeachings';
import { X, RefreshCw, Brain, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../src/components/ScreenWrapper';

export default function EmergencyHelpScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());
  const [breathCount, setBreathCount] = useState(0);

  // Haptic feedback on mount
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const handleNewQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTeaching(getRandomTeaching());
  };

  const handleBreathingExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBreathCount((prev) => prev + 1);
  };

  const getCategoryColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'discipline':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
      case 'resilience':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'wisdom':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
      case 'virtue':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
    }
  };

  const getCategoryTextColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'text-blue-700 dark:text-blue-300';
      case 'discipline':
        return 'text-purple-700 dark:text-purple-300';
      case 'resilience':
        return 'text-amber-700 dark:text-amber-300';
      case 'wisdom':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'virtue':
        return 'text-rose-700 dark:text-rose-300';
    }
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" darkBackgroundColor="#111827">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 pb-6 border-b bg-rose-50 dark:bg-gray-800 border-rose-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">You've Got This</Text>
            <Text className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              This urge will pass. You are stronger.
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="items-center justify-center w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600"
          >
            <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Breathing Exercise */}
        <View className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b">
          <View className="flex-row items-center gap-2 mb-4">
            <Zap size={20} color="#EF4444" strokeWidth={2.5} />
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Breathing Exercise</Text>
          </View>
          <Text className="mb-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Before anything else, take control of your breath. Tap the button and follow along:
          </Text>
          <Pressable
            onPress={handleBreathingExercise}
            className="py-6 bg-gradient-to-r from-rose-500 to-orange-500 dark:from-rose-600 dark:to-orange-600 rounded-2xl active:opacity-80"
          >
            <Text className="text-xl font-bold text-center text-white">
              {breathCount === 0 && 'Start Breathing'}
              {breathCount > 0 && breathCount < 4 && `Breathe In... (${breathCount}/4)`}
              {breathCount >= 4 && breathCount < 8 && `Hold... (${breathCount - 4}/4)`}
              {breathCount >= 8 && breathCount < 12 && `Breathe Out... (${breathCount - 8}/4)`}
              {breathCount >= 12 && 'Great! Do it again'}
            </Text>
          </Pressable>
          {breathCount >= 12 && (
            <Pressable onPress={() => setBreathCount(0)} className="mt-3">
              <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
                Reset breathing counter
              </Text>
            </Pressable>
          )}
        </View>

        {/* Stoic Teaching */}
        <View className="px-6 py-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Brain size={20} color="#059669" strokeWidth={2.5} />
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Stoic Wisdom</Text>
            </View>
            <Pressable
              onPress={handleNewQuote}
              className="flex-row items-center gap-2 px-3 py-2 bg-gray-200 rounded-lg dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600"
            >
              <RefreshCw size={16} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">New</Text>
            </Pressable>
          </View>

          {/* Quote Card */}
          <View
            className={`p-6 border-2 rounded-2xl ${getCategoryColor(currentTeaching.category)}`}
          >
            <Text className="mb-1 text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
              {currentTeaching.category}
            </Text>
            <Text className={`text-xl font-bold leading-8 mb-4 ${getCategoryTextColor(currentTeaching.category)}`}>
              "{currentTeaching.quote}"
            </Text>
            <Text className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              — {currentTeaching.author}
            </Text>
            <View className="pt-4 border-t border-gray-300 dark:border-gray-600">
              <Text className="text-base leading-6 text-gray-700 dark:text-gray-300">
                {currentTeaching.explanation}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Take Action Now</Text>
          <View className="gap-3">
            <View className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Text className="mb-1 font-bold text-gray-900 dark:text-white">💪 Physical Reset</Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                Do 10 push-ups, take a cold shower, go for a walk, or exercise for 5 minutes.
              </Text>
            </View>
            <View className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <Text className="mb-1 font-bold text-gray-900 dark:text-white">🧘 Mental Distraction</Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                Call a friend, work on a hobby, watch an educational video, or meditate for 2 minutes.
              </Text>
            </View>
            <View className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
              <Text className="mb-1 font-bold text-gray-900 dark:text-white">🎯 Remember Your Why</Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                Think about your goals. Why did you start this journey? What's at stake? You've come too far to quit now.
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View className="px-6 pb-12">
          <View className="p-6 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-950/20 dark:to-orange-950/20 rounded-2xl">
            <Text className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              This feeling is temporary
            </Text>
            <Text className="text-base leading-6 text-center text-gray-700 dark:text-gray-300">
              Urges typically last 15-20 minutes. You can outlast this. Stay strong. We believe in you.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
