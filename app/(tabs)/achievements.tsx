import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '../../src/stores/themeStore';
import AchievementsGrid from '../../src/components/AchievementsGrid';
import AchievementDetailModal from '../../src/components/AchievementDetailModal';
import { getAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/AchievementBadge';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { Trophy } from 'lucide-react-native';

export default function AchievementsScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Use centralized hook for journey stats
  const stats = useJourneyStats();

  // Get achievements based on current elapsed time
  const achievements = useMemo(() => {
    return getAchievements(stats.elapsedTime);
  }, [stats.elapsedTime]);

  const unlockedCount = achievements.filter((a:any) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4 bg-amber-50 dark:bg-gray-900">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
                Achievements
              </Text>
              <Text className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                Celebrate your journey milestones
              </Text>
            </View>
            <View className="items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
              <Trophy size={24} color="#f59e0b" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Progress Section Above Achievements */}
        <View className="px-6 mt-6">
          <View className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Your Progress
              </Text>
              <View className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                <Text className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {unlockedCount}/{totalCount}
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View className="mb-3">
              <View className="h-3 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-800">
                <View 
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
            
            {/* Stats Row */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {progressPercentage}% Complete
              </Text>
              <Text className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {totalCount - unlockedCount} remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements Grid */}
        <View className="px-6 mt-6">
          <AchievementsGrid
            achievements={achievements}
            onAchievementPress={(achievement) => setSelectedAchievement(achievement)}
          />
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        visible={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </View>
  );
}
