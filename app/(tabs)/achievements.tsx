import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useColorScheme } from '../../src/stores/themeStore';
import { useThemeColors, useCardShadow } from '../../src/hooks/useThemeColors';
import AchievementRoadmap from '../../src/components/achievements/AchievementRoadmap';
import AchievementDetailModal from '../../src/components/achievements/AchievementDetailModal';
import TabSwitcher from '../../src/components/achievements/TabSwitcher';
import BadgeGrid from '../../src/components/badges/BadgeGrid';
import { getAchievements, getGrowthStage, Achievement } from '../../src/utils/growthStages';
import { computeStreaks, longestPastStreakMs } from '../../src/utils/streaks';
import { formatStreakLength } from '../../src/utils/formatDuration';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { useLatestRelapseTimestamp, useRelapses } from '../../src/stores/relapseStore';
import { getJourneyStart } from '../../src/db/helpers';
import { useBadgeStore } from '../../src/stores/badgeStore';
import { BADGE_DEFINITIONS } from '../../src/data/badgeDefinitions';
import { Badge } from '../../src/db/schema';
import { Trophy, Award } from 'lucide-react-native';
import { badgeOrchestrator } from '../../src/services/badgeOrchestrator';

type TabId = 'milestones' | 'badges';

export default function AchievementsScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const [activeTab, setActiveTab] = useState<TabId>('milestones');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  // Use centralized hook for journey stats
  const stats = useJourneyStats();
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  // Badge store - subscribe to store instead of loading from DB
  const earnedBadges = useBadgeStore((state) => state.earnedBadges);
  const badgeProgress = useBadgeStore((state) => state.badgeProgress);
  const hasHydrated = useBadgeStore((state) => state._hasHydrated);
  const isCheckingBadges = useBadgeStore((state) => state.isCheckingBadges);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Sync badges from database when screen comes into focus
  useEffect(() => {
    // Always sync on mount, regardless of hydration status
    const syncBadges = async () => {
      await badgeOrchestrator.syncBadgesFromDB();
      if (isMountedRef.current) {
        setIsInitialLoad(false);
      }
    };

    syncBadges();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    if (isMountedRef.current) {
      setRefreshing(true);
    }
    await badgeOrchestrator.syncBadgesFromDB();
    if (isMountedRef.current) {
      setRefreshing(false);
    }
  }, []);

  // Load journey start for milestone predictions
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      if (isMountedRef.current) {
        setJourneyStart(start);
      }
    };
    loadJourneyStart();
  }, []);

  // useJourneyStats re-renders exactly when a new stage is reached, so no polling is needed
  const elapsedTime = stats.startTime ? Math.max(0, stats.now - new Date(stats.startTime).getTime()) : 0;
  const achievements = useMemo(() => getAchievements(elapsedTime), [elapsedTime]);

  // "Your best" chip: the furthest stage a finished streak reached, shown while the current one is behind it
  const relapses = useRelapses();
  const bestMarker = useMemo(() => {
    if (!journeyStart || relapses.length === 0) return undefined;
    const bestPastMs = longestPastStreakMs(computeStreaks(relapses, journeyStart));
    if (bestPastMs <= elapsedTime) return undefined;
    return { stageId: getGrowthStage(bestPastMs).id, label: formatStreakLength(bestPastMs) };
  }, [relapses, journeyStart, elapsedTime]);

  // Calculate progress based on active tab
  const earnedBadgeIds = useMemo(
    () => new Set(earnedBadges.map((b) => b.badge_id)),
    [earnedBadges]
  );

  const milestonesUnlocked = achievements.filter((a: any) => a.isUnlocked).length;
  const milestonesTotal = achievements.length;

  const badgesUnlocked = earnedBadgeIds.size;
  const badgesTotal = BADGE_DEFINITIONS.filter((b) => !b.isHidden).length;

  const unlockedCount = activeTab === 'milestones' ? milestonesUnlocked : badgesUnlocked;
  const totalCount = activeTab === 'milestones' ? milestonesTotal : badgesTotal;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Show loading screen only on initial load
  if (isInitialLoad && earnedBadges.length === 0 && !hasHydrated) {
    return (
      <View className="items-center justify-center flex-1 bg-bg">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.gold} />
        <Text className="mt-4 text-base font-medium text-muted">
          Loading achievements...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-fg">
                Achievements
              </Text>
              <Text className="mt-0 text-sm font-medium tracking-wide text-muted">
                {activeTab === 'milestones'
                  ? 'Celebrate your journey milestones'
                  : 'Earn badges for your efforts'}
              </Text>
            </View>
            <View className="items-center justify-center w-14 h-14 bg-gold-soft rounded-2xl">
              {activeTab === 'milestones' ? (
                <Trophy size={26} color={colors.gold} strokeWidth={2.5} />
              ) : (
                <Award size={26} color={colors.gold} strokeWidth={2.5} />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* Progress Section Above Achievements */}
        <View className="px-6 mt-0">
          <View style={cardShadow} className="p-6 bg-surface border border-border rounded-[20px]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-fg">
                Your Progress
              </Text>
              <View className="px-3 py-1.5 bg-gold-soft rounded-full">
                <Text className="text-sm font-bold text-gold-ink">
                  {unlockedCount}/{totalCount}
                </Text>
              </View>
            </View>
            
            
            {/* Progress Bar */}
            <View className="mb-3">
              <View className="h-3 overflow-hidden bg-subtle rounded-full">
                <View
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
            
            {/* Stats Row */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-muted">
                {progressPercentage}% Complete
              </Text>
              <Text className="text-sm font-semibold text-gold-ink">
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
              bestMarker={bestMarker}
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
          progress={badgeProgress[selectedBadge.id]?.progress}
          current={badgeProgress[selectedBadge.id]?.current}
          required={badgeProgress[selectedBadge.id]?.required}
          visible={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </View>
  );
}
