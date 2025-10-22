import { View, Text, Pressable, Modal, ScrollView, InteractionManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useColorScheme } from '../../src/stores/themeStore';
import { useAchievementStore } from '../../src/stores/achievementStore';
import RelapseModal from '../../src/components/modals/RelapseModal';
import UrgeModal from '../../src/components/modals/UrgeModal';
import EmergencyHelpModal from '../../src/components/modals/EmergencyHelpModal';
import { JourneyTimerCard } from '../../src/components/home/JourneyTimerCard';
import { QuickActions } from '../../src/components/home/QuickActions';
import { StoicWisdomCard } from '../../src/components/home/StoicWisdomCard';
import AchievementCelebration from '../../src/components/achievements/AchievementCelebration';
import { getNewlyUnlockedAchievements, Achievement } from '../../src/utils/growthStages';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import { Shield, AlertCircle, RotateCcw, Sparkles, TrendingUp, Award, Heart, BarChart3 } from 'lucide-react-native';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import InsightsModal from '../../src/components/history/InsightsModal';

function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [showModal, setShowModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const relapses = useRelapseStore((state) => state.relapses);
  const urges = useUrgeStore((state) => state.urges);
  const loadUrges = useUrgeStore((state) => state.loadUrges);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  // Achievement tracking store
  const lastCheckedElapsedTime = useAchievementStore((state) => state.lastCheckedElapsedTime);
  const setLastCheckedElapsedTime = useAchievementStore((state) => state.setLastCheckedElapsedTime);
  const achievementStoreHydrated = useAchievementStore((state) => state._hasHydrated);

  // Use centralized hook for journey stats (now optimized - no continuous updates)
  const stats = useJourneyStats();

  // Track previous elapsed time for achievement detection
  const previousElapsedRef = useRef<number>(0);

  // Removed continuous pulse animation for emergency button
  // Using static button to save battery and CPU resources
  // Animation was causing unnecessary re-renders and battery drain

  // Defer urge loading until after screen is fully rendered (performance optimization)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadUrges();
    });

    return () => task.cancel();
  }, [relapses, loadUrges]);

  // Check for missed achievements on app open (runs once after hydration)
  useEffect(() => {
    if (!stats.startTime || !achievementStoreHydrated) return;

    const currentElapsed = Math.max(0, Date.now() - new Date(stats.startTime!).getTime());

    // Get achievements that were unlocked since last check
    const missedAchievements = getNewlyUnlockedAchievements(
      currentElapsed,
      lastCheckedElapsedTime
    );

    if (missedAchievements.length > 0) {
      // Queue achievements to show sequentially
      setPendingAchievements(missedAchievements);
      // Show the first one immediately
      setCelebrationAchievement(missedAchievements[0]);
    }

    // Update last checked time (only once on mount)
    setLastCheckedElapsedTime(currentElapsed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.startTime, achievementStoreHydrated]);

  // Memoize user stats calculation to prevent recalculation on every render
  const userStats = useMemo(
    () => calculateUserStats(relapses, stats.startTime, urges),
    [relapses, stats.startTime, urges]
  );

  // Achievement detection: monitor elapsed time and trigger celebrations while app is open
  useEffect(() => {
    if (!stats.startTime) return;

    const checkAchievements = () => {
      const currentElapsed = Math.max(0, Date.now() - new Date(stats.startTime!).getTime());
      const previousElapsed = previousElapsedRef.current;

      // Check if any new achievements were unlocked
      const newAchievements = getNewlyUnlockedAchievements(currentElapsed, previousElapsed);

      if (newAchievements.length > 0) {
        // Queue achievements to show sequentially
        setPendingAchievements(prev => [...prev, ...newAchievements]);

        // If no achievement is currently showing, show the first one
        if (!celebrationAchievement) {
          setCelebrationAchievement(newAchievements[0]);
        }

        // Update last checked time in store
        setLastCheckedElapsedTime(currentElapsed);
      }

      // Update previous elapsed time
      previousElapsedRef.current = currentElapsed;
    };

    // Initialize previousElapsedRef on mount to prevent false triggers
    const initialElapsed = Math.max(0, Date.now() - new Date(stats.startTime!).getTime());
    previousElapsedRef.current = initialElapsed;

    // Check every second for new achievements (no immediate check on mount)
    const interval = setInterval(checkAchievements, 1000);

    return () => clearInterval(interval);
  }, [stats.startTime, celebrationAchievement, setLastCheckedElapsedTime]);

  const handleRelapsePress = () => {
    setShowModal(true);
  };

  const handleUrgePress = () => {
    setShowUrgeModal(true);
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  const handleCelebrationClose = () => {
    // Remove the current achievement from the queue and show next one
    setPendingAchievements(prev => {
      const remaining = prev.slice(1);

      if (remaining.length > 0) {
        // Show next achievement
        setCelebrationAchievement(remaining[0]);
      } else {
        // No more achievements to show
        setCelebrationAchievement(null);
      }

      return remaining;
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4 ml-1">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-0">
              <Text className="text-2xl font-semibold tracking-wide text-gray-900 dark:text-white">
                {stats.growthStage.achievementTitle}
              </Text>
              <Text className="text-2xl">{stats.growthStage.emoji}</Text>
            </View>
            <Text className="pr-2 mt-0 text-sm tracking-wide font-regular text-emerald-700 dark:text-emerald-400">
              {stats.growthStage.description}
            </Text>
          </View>

          {/* Emergency Help Button */}
          <Pressable
            onPress={handleHelpPress}
            style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(153, 27, 27, 0.3)' : '#fecaca' }}
            className="items-center justify-center bg-red-200 w-14 h-14 rounded-2xl active:scale-95"
          >
            <AlertCircle size={28} color="#ef4444" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Hero Section - Journey Timer Card */}
        <View className="py-6 -mt-4">
          {stats.startTime && (
            <JourneyTimerCard
              startTime={stats.startTime}
              growthStage={{
                emoji: stats.growthStage.emoji,
                achievementTitle: stats.growthStage.achievementTitle,
                description: stats.growthStage.description,
              }}
              nextCheckpoint={stats.checkpointProgress?.nextCheckpoint}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-6">
            {/* Resisted Urge - Primary Action */}
            <Pressable
              onPress={handleUrgePress}
              className="flex-1 shadow-sm bg-blue-600/90 dark:bg-blue-600/20 rounded-2xl"
            >
              <View className="items-center px-4 py-6">
                <View className="items-center justify-center mb-3 w-14 h-14 bg-white/20 rounded-2xl">
                  <Shield size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text className="mb-1 text-base font-bold text-center text-white">
                  Resisted Urge
                </Text>
                <Text className="text-xs text-center text-blue-100">
                  Track your strength
                </Text>
              </View>
            </Pressable>

            {/* Record Relapse - Secondary Action */}
            <Pressable
              onPress={handleRelapsePress}
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="flex-1 shadow-sm rounded-2xl shadow-black"
            >
              <View className="items-center px-4 py-6">
                <View className="items-center justify-center mb-3 w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                  <RotateCcw size={28} color="#10b981" strokeWidth={2.5} />
                </View>
                <Text className="mb-1 text-base font-bold text-center text-gray-800 dark:text-gray-200">
                  Record Relapse
                </Text>
                <Text className="text-xs text-center text-gray-500 dark:text-gray-400">
                  It's okay to restart
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Stats Grid - Redesigned with Icons */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <TrendingUp size={20} strokeWidth={2.5} color={colorScheme === 'dark' ? '#6ee7b7' : '#10b981'} />
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Keep growing
              </Text>
            </View>
          </View>

          {/* First Row */}
          <View className="flex-row gap-6 mb-6">
            {/* Total Attempts */}
            <View
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="relative flex-1 overflow-hidden shadow-sm shadow-black rounded-2xl"
            >
              <View className="p-4">
                <Text className="mb-2 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Total Attempts
                </Text>
                <Text className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {userStats.totalAttempts}
                </Text>
              </View>
              {/* Background Icon */}
              <View className="absolute bottom-[-8px] right-[-8px] opacity-15">
                <RotateCcw size={70} color="#10b981" strokeWidth={2} />
              </View>
            </View>

            {/* Best Streak */}
            <View
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="relative flex-1 overflow-hidden shadow-sm shadow-black rounded-2xl"
            >
              <View className="p-4">
                <Text className="mb-2 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Best Streak
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {userStats.bestStreak}
                  </Text>
                  <Text className="text-sm font-medium text-amber-500 dark:text-amber-500">
                    days
                  </Text>
                </View>
              </View>
              {/* Background Icon */}
              <View className="absolute bottom-[-8px] right-[-8px] opacity-15 dark:opacity-10">
                <Award size={70} color="#f59e0b" strokeWidth={2} />
              </View>
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row gap-6">
            {/* Urges Resisted */}
            <View
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="relative flex-1 overflow-hidden shadow-sm shadow-black rounded-2xl"
            >
              <View className="p-4">
                <Text className="mb-2 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Urges Resisted
                </Text>
                <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.urgesResisted}
                </Text>
              </View>
              {/* Background Icon */}
              <View className="absolute bottom-[-8px] right-[-8px] opacity-15 dark:opacity-10">
                <Shield size={70} color="#3b82f6" strokeWidth={2} />
              </View>
            </View>

            {/* Success Rate */}
            <View
              style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
              className="relative flex-1 overflow-hidden shadow-sm shadow-black rounded-2xl"
            >
              <View className="p-4">
                <Text className="mb-2 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Success Rate
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {userStats.resistanceRate}
                  </Text>
                  <Text className="text-sm font-medium text-purple-500 dark:text-purple-500">
                    %
                  </Text>
                </View>
              </View>
              {/* Background Icon */}
              <View className="absolute bottom-[-8px] right-[-8px] opacity-15 dark:opacity-10">
                <Heart size={70} color="#a855f7" strokeWidth={2} />
              </View>
            </View>
          </View>

        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stoic Wisdom */}
        <StoicWisdomCard />

        {/* Relapse Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <RelapseModal onClose={() => setShowModal(false)} />
        </Modal>

        {/* Urge Modal */}
        <Modal
          visible={showUrgeModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowUrgeModal(false)}
        >
          <UrgeModal onClose={() => setShowUrgeModal(false)} />
        </Modal>

        {/* Emergency Help Modal */}
        <Modal
          visible={showHelpModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <EmergencyHelpModal onClose={() => setShowHelpModal(false)} />
        </Modal>

        {/* Achievement Celebration Modal */}
        <AchievementCelebration
          achievement={celebrationAchievement}
          visible={!!celebrationAchievement}
          onClose={handleCelebrationClose}
        />

        {/* Insights Modal */}
        <Modal
          visible={showInsightsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowInsightsModal(false)}
        >
          <InsightsModal onClose={() => setShowInsightsModal(false)} />
        </Modal>
      </ScrollView>
    </View>
  );
}

// Memoize to prevent unnecessary re-renders on tab switches
export default memo(DashboardScreen);
