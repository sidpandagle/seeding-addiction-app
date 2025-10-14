import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef, memo } from 'react';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, withSpring, useSharedValue, withRepeat, withSequence } from 'react-native-reanimated';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useColorScheme } from '../../src/stores/themeStore';
import RelapseModal from '../../src/components/RelapseModal';
import UrgeModal from '../../src/components/UrgeModal';
import EmergencyHelpModal from '../../src/components/EmergencyHelpModal';
import CircularProgress from '../../src/components/CircularProgress';
import { MotivationCard } from '../../src/components/MotivationCard';
import AchievementCelebration from '../../src/components/AchievementCelebration';
import LiveTimer from '../../src/components/home/LiveTimer';
import { GrowthStage } from '../../src/utils/growthStages';
import GrowthIcon from '../../src/components/GrowthIcon';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import { getNewlyUnlockedAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/AchievementBadge';
import { Shield, AlertCircle, RotateCcw, Sparkles, TrendingUp, Award, Heart } from 'lucide-react-native';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import ModalErrorFallback from '../../src/components/ModalErrorFallback';

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
  const previousTimeRef = useRef<number>(0);
  const lastShownAchievementIdRef = useRef<string | null>(null);
  const achievementCheckInProgressRef = useRef<boolean>(false);
  
  // Animation values
  const pulseScale = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-1);

  // Use centralized hook for journey stats
  const stats = useJourneyStats();

  // Subtle pulse animation for emergency button
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      false
    );
  }, []);

  const emergencyButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Load urges on mount and when relapses change
  useEffect(() => {
    loadUrges();
    // Reset achievement tracking when relapses change (new relapse recorded)
    lastShownAchievementIdRef.current = null;
    previousTimeRef.current = 0;
  }, [relapses, loadUrges]);

  // Calculate user stats (urges and resistance rate)
  const userStats = calculateUserStats(relapses, stats.startTime, urges);

  // Check for newly unlocked achievements (debounce to prevent duplicates)
  useEffect(() => {
    const currentElapsedTime = stats.timeDiff;

    // Skip if check already in progress
    if (achievementCheckInProgressRef.current) {
      return;
    }

    if (previousTimeRef.current > 0 && currentElapsedTime > previousTimeRef.current) {
      const newAchievements = getNewlyUnlockedAchievements(currentElapsedTime, previousTimeRef.current);
      if (newAchievements.length > 0) {
        const firstNewAchievement = newAchievements[0];
        // Only show if we haven't already shown this specific achievement
        if (lastShownAchievementIdRef.current !== firstNewAchievement.id) {
          achievementCheckInProgressRef.current = true;
          lastShownAchievementIdRef.current = firstNewAchievement.id;
          setCelebrationAchievement(firstNewAchievement);
        }
      }
    }
    previousTimeRef.current = currentElapsedTime;
  }, [stats.timeDiff]);

  // Reset achievement check lock when celebration is closed
  useEffect(() => {
    if (!celebrationAchievement) {
      achievementCheckInProgressRef.current = false;
    }
  }, [celebrationAchievement]);

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
      <View className="pt-16 pb-4 ml-1">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-1">
            <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
              Seeding
            </Text>
            <Text className="mt-0 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {stats.growthStage.description}
            </Text>
          </View>
          
          {/* Emergency Help Button with Pulse */}
          <Animated.View style={emergencyButtonStyle}>
            <Pressable
              onPress={handleHelpPress}
              className="items-center justify-center bg-white border border-gray-200 w-14 h-14 dark:bg-gray-800 dark:border-gray-700 rounded-2xl active:scale-95"
            >
              <AlertCircle size={28} color="#ef4444" strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Hero Section - Circular Progress with Timer */}
        <View className="items-center px-6 py-8 -mt-4">
          {/* Floating Card Effect */}
          <View className="items-center w-full p-8 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-3xl">

            {/* Circular Progress */}
            <CircularProgress
              size={260}
              strokeWidth={16}
              progress={stats.checkpointProgress?.progress ?? 0}
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
            <View className="px-6 py-3 mt-6 border-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-emerald-200 dark:border-emerald-800">
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
          <View className="flex-row gap-3">
            {/* Resisted Urge - Primary Action */}
            <Pressable
              onPress={handleUrgePress}
              className="flex-1 bg-blue-600/90 dark:bg-blue-900/40 rounded-2xl"
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
              className="flex-1 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl active:scale-95"
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
          <View className="flex-row items-center justify-between mb-4">
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
          <View className="flex-row gap-3 mb-3">
            {/* Total Attempts */}
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
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
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
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
          <View className="flex-row gap-3">
            {/* Urges Resisted */}
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
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
            <View className="relative flex-1 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
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
          <ErrorBoundary fallback={<ModalErrorFallback onClose={() => setShowModal(false)} />}>
            <RelapseModal onClose={() => setShowModal(false)} />
          </ErrorBoundary>
        </Modal>

        {/* Urge Modal */}
        <Modal
          visible={showUrgeModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowUrgeModal(false)}
        >
          <ErrorBoundary fallback={<ModalErrorFallback onClose={() => setShowUrgeModal(false)} />}>
            <UrgeModal onClose={() => setShowUrgeModal(false)} />
          </ErrorBoundary>
        </Modal>

        {/* Emergency Help Modal */}
        <Modal
          visible={showHelpModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <ErrorBoundary fallback={<ModalErrorFallback onClose={() => setShowHelpModal(false)} />}>
            <EmergencyHelpModal onClose={() => setShowHelpModal(false)} />
          </ErrorBoundary>
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
