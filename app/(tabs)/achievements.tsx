import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import AchievementsGrid from '../../src/components/AchievementsGrid';
import { getJourneyStart } from '../../src/db/helpers';
import { getAchievements } from '../../src/data/achievements';

export default function AchievementsScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  // Load journey start timestamp
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  const stats = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      // No relapses - use journey start time
      startTime = journeyStart;
    } else {
      // Has relapses - use last relapse time
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    const elapsedTime = startTime ? Math.max(0, Date.now() - new Date(startTime).getTime()) : 0;

    return {
      elapsedTime,
    };
  }, [relapses, journeyStart]);

  // Get achievements based on current elapsed time
  const achievements = useMemo(() => {
    return getAchievements(stats.elapsedTime);
  }, [stats.elapsedTime]);

  const unlockedCount = achievements.filter((a:any) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</Text>
        <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Unlocked {unlockedCount} of {totalCount} achievements
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-6">
        {/* Progress Overview */}
        {/* <View className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Your Progress
            </Text>
            <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </Text>
          </View>
          <View className="h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
            <View
              className="h-full bg-emerald-600 dark:bg-emerald-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </View>
        </View> */}

        {/* Motivation Message */}
        <View className="p-4 mb-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
          <Text className="text-sm text-emerald-900 dark:text-emerald-200">
            {unlockedCount === 0
              ? '🌱 Start your journey to unlock achievements!'
              : unlockedCount === totalCount
              ? '🏆 Congratulations! You\'ve unlocked all achievements!'
              : `🚀 Keep going! ${totalCount - unlockedCount} more to unlock.`}
          </Text>
        </View>

        {/* Achievements Grid */}
        <AchievementsGrid achievements={achievements} />
      </ScrollView>
    </View>
  );
}
