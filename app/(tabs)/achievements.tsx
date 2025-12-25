import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useColorScheme } from '../../src/stores/themeStore';
import AchievementRoadmap from '../../src/components/achievements/AchievementRoadmap';
import AchievementDetailModal from '../../src/components/achievements/AchievementDetailModal';
import TabSwitcher from '../../src/components/achievements/TabSwitcher';
import BadgeGrid from '../../src/components/badges/BadgeGrid';
import { getAchievements, Achievement } from '../../src/utils/growthStages';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { useLatestRelapseTimestamp } from '../../src/stores/relapseStore';
import { getJourneyStart, getEarnedBadges } from '../../src/db/helpers';
import { useBadgeStore } from '../../src/stores/badgeStore';
import { BADGE_DEFINITIONS } from '../../src/data/badgeDefinitions';
import { Badge } from '../../src/db/schema';
import { Trophy, Award } from 'lucide-react-native';

type TabId = 'milestones' | 'badges';

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<TabId>('milestones');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  // Use centralized hook for journey stats
  const stats = useJourneyStats();
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  // Badge store
  const earnedBadges = useBadgeStore((state) => state.earnedBadges);
  const badgeProgress = useBadgeStore((state) => state.badgeProgress);
  const setEarnedBadges = useBadgeStore((state) => state.setEarnedBadges);

  // Load earned badges from database
  useEffect(() => {
    const loadBadges = async () => {
      const badges = await getEarnedBadges();
      setEarnedBadges(badges);
    };
    loadBadges();
  }, [setEarnedBadges]);

  // Load journey start for milestone predictions
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

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

  // Calculate progress based on active tab
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));

  const milestonesUnlocked = achievements.filter((a: any) => a.isUnlocked).length;
  const milestonesTotal = achievements.length;

  const badgesUnlocked = earnedBadgeIds.size;
  const badgesTotal = BADGE_DEFINITIONS.filter((b) => !b.isHidden).length;

  const unlockedCount = activeTab === 'milestones' ? milestonesUnlocked : badgesUnlocked;
  const totalCount = activeTab === 'milestones' ? milestonesTotal : badgesTotal;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                Achievements
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-amber-700 dark:text-amber-400">
                {activeTab === 'milestones'
                  ? 'Celebrate your journey milestones'
                  : 'Earn badges for your efforts'}
              </Text>
            </View>
            <View className="items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
              {activeTab === 'milestones' ? (
                <Trophy size={26} color="#f59e0b" strokeWidth={2.5} />
              ) : (
                <Award size={26} color="#f59e0b" strokeWidth={2.5} />
              )}
            </View>
          </View>

          {/* Tab Switcher */}
          <TabSwitcher
            tabs={[
              { id: 'milestones', label: 'Milestones' },
              { id: 'badges', label: 'Badges' },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-4"
      >
        {/* Progress Section Above Achievements */}
        <View className="px-6 mt-0">
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
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-600"
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

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'milestones' ? (
          <View className="px-6 mt-6">
            <AchievementRoadmap
              achievements={achievements}
              onAchievementPress={(achievement) => setSelectedAchievement(achievement)}
              referenceTime={
                latestRelapseTimestamp
                  ? new Date(latestRelapseTimestamp).getTime()
                  : journeyStart
                  ? new Date(journeyStart).getTime()
                  : null
              }
            />
          </View>
        ) : (
          <View className="mt-6">
            <BadgeGrid
              badges={BADGE_DEFINITIONS.filter((b) => !b.isHidden)}
              earnedBadgeIds={earnedBadgeIds}
              earnedBadges={earnedBadges}
              badgeProgress={badgeProgress}
              onBadgePress={(badge) => setSelectedBadge(badge)}
            />
          </View>
        )}
      </ScrollView>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        visible={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <AchievementDetailModal
          achievement={{
            id: selectedBadge.id,
            title: selectedBadge.title,
            description: selectedBadge.description,
            emoji: selectedBadge.emoji,
            threshold: 0, // Badges don't have time thresholds
            shortLabel: '',
            isUnlocked: earnedBadgeIds.has(selectedBadge.id),
            unlockedAt: earnedBadges.find((b) => b.badge_id === selectedBadge.id)?.unlocked_at,
          }}
          visible={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </View>
  );
}
