import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import AchievementsGrid from '../../src/components/AchievementsGrid';
import AchievementDetailModal from '../../src/components/AchievementDetailModal';
import { getJourneyStart } from '../../src/db/helpers';
import { getAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/AchievementBadge';

export default function AchievementsScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

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

  const unlockedCount = achievements.filter((a:any) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-[#1A1825]">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Minimal Header */}
      <View className="px-6 pt-16 pb-6 bg-white dark:bg-[#252336]">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Achievements
        </Text>
        <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {unlockedCount} of {totalCount} unlocked
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Motivation Message */}
        <View className="p-5 mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
          <Text className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">
            {unlockedCount === 0
              ? '🌱 Every journey begins with a single step'
              : unlockedCount === totalCount
              ? '✨ You\'ve unlocked all achievements. Remarkable!'
              : `🌿 Keep nurturing your growth. ${totalCount - unlockedCount} more await.`}
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
