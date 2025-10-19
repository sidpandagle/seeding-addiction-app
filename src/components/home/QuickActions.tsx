import React, { memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dumbbell, Wind, Brain, Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

/**
 * Quick action cards to help users resist urges
 * Condensed version of emergency help actions for proactive home screen display
 */
const QuickActionsComponent: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <View className="px-6 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Quick Actions to Resist Urges
          </Text>
        </View>
      </View>

      {/* Action Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
      >
        {/* Physical Reset */}
        <View className="p-4 border w-72 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 rounded-2xl">
          <View className="flex-row items-center gap-2 mb-2">
            <Dumbbell size={20} color="#3b82f6" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">Physical Reset</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
            Do 10 push-ups, take a cold shower, go for a walk, or sprint. Your body needs to remember who's boss.
          </Text>
        </View>

        {/* Breathe */}
        <View className="p-4 border w-72 border-cyan-200 bg-cyan-50 dark:bg-cyan-950/30 dark:border-cyan-800 rounded-2xl">
          <View className="flex-row items-center gap-2 mb-2">
            <Wind size={20} color="#06b6d4" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">Breathe, Seriously</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
            Breathe in for 4, hold for 4, out for 4. Repeat 5 times. Trick your nervous system into calming down.
          </Text>
        </View>

        {/* Mental Distraction */}
        <View className="p-4 border w-72 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-2xl">
          <View className="flex-row items-center gap-2 mb-2">
            <Brain size={20} color="#10b981" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">Mental Distraction</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
            Call a friend, work on that hobby you keep postponing, watch a documentary, or meditate.
          </Text>
        </View>

        {/* Remember Your Why */}
        <View className="p-4 border w-72 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 rounded-2xl">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-xl">🎯</Text>
            <Text className="text-base font-bold text-gray-900 dark:text-white">Remember Your Why</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
            Think about your goals. Why did you start this journey? Future you is rooting for present you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
