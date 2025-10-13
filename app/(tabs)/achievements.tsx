import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo } from 'react';
import { useThemeStore } from '../../src/stores/themeStore';
import AchievementsGrid from '../../src/components/AchievementsGrid';
import AchievementDetailModal from '../../src/components/AchievementDetailModal';
import { getAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/AchievementBadge';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';

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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</Text>
        <Text className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
          Unlocked {unlockedCount} of {totalCount} achievements
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
      >
        {/* Motivation Message */}
        <View className="p-4 mb-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
          <Text className="text-sm text-emerald-900 dark:text-emerald-200">
            {unlockedCount === 0
              ? '🌱 You don’t win this fight once — you win it every damn day!'
              : unlockedCount === totalCount
              ? '🏆 Congratulations! You\'ve unlocked all achievements!'
              : `🚀 Keep going! ${totalCount - unlockedCount} more to unlock.`}
          </Text>
        </View>

        {/* Achievements Grid */}
        <AchievementsGrid
          achievements={achievements}
          onAchievementPress={(achievement) => setSelectedAchievement(achievement)}
        />
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
