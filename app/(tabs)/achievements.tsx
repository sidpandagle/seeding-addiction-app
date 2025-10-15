import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from '../../src/stores/themeStore';
import AchievementsGrid from '../../src/components/achievements/AchievementsGrid';
import AchievementDetailModal from '../../src/components/achievements/AchievementDetailModal';
import { getAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/achievements/AchievementBadge';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { Trophy } from 'lucide-react-native';

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Use centralized hook for journey stats
  const stats = useJourneyStats();

  // Live achievements state that updates every second
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAchievements(0));

  // Update achievements every second based on elapsed time
  // Note: getAchievements() is internally memoized (1-minute cache)
  // This reduces re-renders from 60/min to 1/min when no achievement changes
  useEffect(() => {
    if (!stats.startTime) {
      setAchievements(getAchievements(0));
      return;
    }

    const updateAchievements = () => {
      const elapsedTime = Math.max(0, Date.now() - new Date(stats.startTime!).getTime());
      const newAchievements = getAchievements(elapsedTime);

      // Only update state if achievements actually changed (reference equality check)
      // getAchievements() returns cached reference if nothing changed
      setAchievements(prev => {
        if (prev === newAchievements) return prev;
        return newAchievements;
      });
    };

    // Initial update
    updateAchievements();

    // Update every second
    const interval = setInterval(updateAchievements, 1000);

    return () => clearInterval(interval);
  }, [stats.startTime]);

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
