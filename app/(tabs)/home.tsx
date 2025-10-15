import { View, Text, Pressable, Modal, ScrollView, InteractionManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useColorScheme } from '../../src/stores/themeStore';
import RelapseModal from '../../src/components/modals/RelapseModal';
import UrgeModal from '../../src/components/modals/UrgeModal';
import EmergencyHelpModal from '../../src/components/modals/EmergencyHelpModal';
import CircularProgress from '../../src/components/home/CircularProgress';
import { MotivationCard } from '../../src/components/home/MotivationCard';
import AchievementCelebration from '../../src/components/achievements/AchievementCelebration';
import LiveTimer from '../../src/components/home/LiveTimer';
import { GrowthStage } from '../../src/utils/growthStages';
import GrowthIcon from '../../src/components/home/GrowthIcon';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import { Achievement } from '../../src/components/achievements/AchievementBadge';
import { Shield, AlertCircle, RotateCcw, Sparkles, TrendingUp, Award, Heart } from 'lucide-react-native';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { getNewlyUnlockedAchievements } from '../../src/data/achievements';

function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [showModal, setShowModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const relapses = useRelapseStore((state) => state.relapses);
  const urges = useUrgeStore((state) => state.urges);
  const loadUrges = useUrgeStore((state) => state.loadUrges);
  const previousStageRef = useRef<GrowthStage | null>(null);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);

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

  // Memoize user stats calculation to prevent recalculation on every render
  const userStats = useMemo(
    () => calculateUserStats(relapses, stats.startTime, urges),
    [relapses, stats.startTime, urges]
  );

  // Achievement detection: monitor elapsed time and trigger celebrations
  useEffect(() => {
    if (!stats.startTime) return;

    const checkAchievements = () => {
      const currentElapsed = Math.max(0, Date.now() - new Date(stats.startTime!).getTime());
      const previousElapsed = previousElapsedRef.current;

      // Check if any new achievements were unlocked
      const newAchievements = getNewlyUnlockedAchievements(currentElapsed, previousElapsed);

      if (newAchievements.length > 0) {
        // Show celebration for the first newly unlocked achievement
        setCelebrationAchievement(newAchievements[0]);
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
  }, [stats.startTime]);

  // Handle growth stage transitions
  const handleStageChange = (newStage: GrowthStage) => {
    previousStageRef.current = newStage;
  };


  const handleRelapsePress = () => {
    setShowModal(true);
  };

  const handleUrgePress = () => {
    setShowUrgeModal(true);
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-2 ml-1">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-1">
            <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
              Seeding
            </Text>
            <Text className="mt-0 text-sm font-medium tracking-widest text-emerald-700 dark:text-emerald-400">
              {stats.growthStage.description}
            </Text>
          </View>

          {/* Emergency Help Button */}
          <Pressable
            onPress={handleHelpPress}
            className="items-center justify-center bg-white w-14 h-14 dark:bg-red-800/30 rounded-2xl active:scale-95"
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
        {/* Hero Section - Circular Progress with Timer */}
        <View className="items-center px-6 pt-8 pb-6 -mt-4">
          {/* Floating Card Effect */}
          <View className="items-center w-full p-8 bg-white border border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900 rounded-3xl">

            {/* Circular Progress */}
            <CircularProgress
              size={260}
              strokeWidth={16}
              startTime={stats.startTime ?? undefined}
              currentCheckpointDuration={stats.checkpointProgress?.currentCheckpoint?.duration ?? undefined}
              nextCheckpointDuration={stats.checkpointProgress?.nextCheckpoint?.duration ?? undefined}
              useGradient={true}
              gradientColors={['#10b981', '#34d399', '#6ee7b7']}
              backgroundColor={colorScheme === 'dark' ? '#1f2937' : '#f0fdf4'}
              showCheckpoint={false}
            >
              <View className="items-center">
                {/* Growth Icon with Glow Effect */}
                <View className="mb-4">
                  <GrowthIcon
                    stage={stats.growthStage.id}
                    size={70}
                    animated={true}
                    glowing={true}
                    onStageChange={handleStageChange}
                  />
                </View>

                {/* Live Timer */}
                {stats.startTime && <LiveTimer startTime={stats.startTime} showDays={true} />}
              </View>
            </CircularProgress>

            {/* Merged: Growth Stage + Next Checkpoint */}
            <View className="px-6 py-3 mt-6 border bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-emerald-200 dark:border-emerald-800">
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-xl">{stats.growthStage.emoji}</Text>
                <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {stats.growthStage.label}
                </Text>
                <Text className="mx-1 text-emerald-400 dark:text-emerald-500">•</Text>
                <Text className="text-base">🎯</Text>
                <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {stats.checkpointProgress?.isCompleted
                    ? 'All milestones achieved!'
                    : stats.checkpointProgress?.nextCheckpoint
                      ? `${stats.checkpointProgress.nextCheckpoint.label}`
                      : 'Starting your journey...'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-6">
            {/* Resisted Urge - Primary Action */}
            <Pressable
              onPress={handleUrgePress}
              className="flex-1 border border-gray-200 shadow-sm bg-blue-600/90 dark:border-blue-800 dark:bg-blue-600/20 rounded-2xl"
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
              className="flex-1 bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 rounded-2xl"
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
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Your Progress
            </Text>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={18} color={colorScheme === 'dark' ? '#6ee7b7' : '#10b981'} />
              <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Keep growing
              </Text>
            </View>
          </View>

          {/* First Row */}
          <View className="flex-row gap-6 mb-6">
            {/* Total Attempts */}
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-2xl dark:border-gray-800">
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
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-2xl dark:border-gray-800">
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
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-2xl dark:border-gray-800">
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
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-900 rounded-2xl dark:border-gray-800">
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

        {/* Motivation Card */}
        <MotivationCard />

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
          onClose={() => setCelebrationAchievement(null)}
        />
      </ScrollView>
    </View>
  );
}

// Memoize to prevent unnecessary re-renders on tab switches
export default memo(DashboardScreen);
