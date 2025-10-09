import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useThemeStore } from '../../src/stores/themeStore';
import RelapseModal from '../../src/components/RelapseModal';
import UrgeModal from '../../src/components/UrgeModal';
import CircularProgress from '../../src/components/CircularProgress';
import { MotivationCard } from '../../src/components/MotivationCard';
import AchievementCelebration from '../../src/components/AchievementCelebration';
import { getJourneyStart } from '../../src/db/helpers';
import { getCheckpointProgress, formatTimeRemaining } from '../../src/utils/checkpointHelpers';
import { getGrowthStage, GrowthStage } from '../../src/utils/growthStages';
import GrowthIcon from '../../src/components/GrowthIcon';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import { getNewlyUnlockedAchievements } from '../../src/data/achievements';
import { Achievement } from '../../src/components/AchievementBadge';
import * as Haptics from 'expo-haptics';
import { Sparkles, Shield, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [showModal, setShowModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const relapses = useRelapseStore((state) => state.relapses);
  const urges = useUrgeStore((state) => state.urges);
  const loadUrges = useUrgeStore((state) => state.loadUrges);
  const previousStageRef = useRef<GrowthStage | null>(null);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const previousTimeRef = useRef<number>(0);
  const lastShownAchievementIdRef = useRef<string | null>(null);
  const achievementCheckInProgressRef = useRef<boolean>(false);

  // Load journey start timestamp and urges (reload when relapses change, e.g., after reset)
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
    loadUrges();
    // Reset achievement tracking when relapses change (new relapse recorded)
    lastShownAchievementIdRef.current = null;
    previousTimeRef.current = 0;
  }, [relapses, loadUrges]);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second instead of 100ms to reduce re-renders

    return () => clearInterval(interval);
  }, []);

  // Memoize user stats separately - they only change when relapses/urges/journeyStart change
  const userStats = useMemo(() => {
    return calculateUserStats(relapses, journeyStart, urges);
  }, [relapses, journeyStart, urges]);

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

    if (!startTime) {
      return {
        streak: 0,
        total: 0,
        lastRelapse: null,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        timeDiff: 0,
        checkpointProgress: null,
        growthStage: getGrowthStage(0), // Default to first stage
        bestStreak: 0,
        totalAttempts: 0,
      };
    }

    const timeDiff = Math.max(0, currentTime - new Date(startTime).getTime());

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Calculate checkpoint progress
    const checkpointProgress = getCheckpointProgress(timeDiff);

    // Calculate growth stage
    const growthStage = getGrowthStage(timeDiff);

    return {
      streak: days,
      total: relapses.length,
      lastRelapse: relapses.length > 0 ? startTime : null,
      days,
      hours,
      minutes,
      seconds,
      timeDiff,
      checkpointProgress,
      growthStage,
      bestStreak: userStats.bestStreak,
      totalAttempts: userStats.totalAttempts,
    };
  }, [relapses, currentTime, journeyStart, userStats]);

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

  // Handle growth stage transitions with haptic feedback
  const handleStageChange = (newStage: GrowthStage) => {
    if (previousStageRef.current && previousStageRef.current !== newStage) {
      // Stage has changed - trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousStageRef.current = newStage;
  };


  const handleRelapsePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  const handleUrgePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUrgeModal(true);
  };

  const handleHelpPress = () => {
    router.push('/emergency-help');
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 pb-6 border-b bg-emerald-50 dark:bg-gray-800 border-emerald-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3">
          <View className="items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <Sparkles size={24} color="#059669" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Seeding</Text>
            <Text className="text-sm text-emerald-600 dark:text-emerald-400">Track your progress</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">

        {/* Stats Cards */}
        <View className="">
          {/* <View className="items-center p-6 mb-4 bg-white shadow-sm rounded-2xl"> */}
          <View className="items-center p-6 mb-6 rounded-2xl">
            <Text className="mb-4 text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Current Streak
            </Text>

            {/* Circular Progress */}
            <CircularProgress
              size={240}
              strokeWidth={14}
              progress={stats.checkpointProgress?.progress ?? 0}
              useGradient={true}
              gradientColors={['#07b087', '#8ace19']}
              backgroundColor={colorScheme === 'dark' ? '#1F2937' : '#E8F5E9'}
              showCheckpoint={true}
              checkpointLabel={
                stats.checkpointProgress?.isCompleted
                  ? 'All milestones achieved! 🎉'
                  : stats.checkpointProgress?.nextCheckpoint
                    ? `Next: ${stats.checkpointProgress.nextCheckpoint.label} (${formatTimeRemaining(stats.checkpointProgress.nextCheckpoint.duration - stats.timeDiff)} left)`
                    : 'Starting your journey...'
              }
            >
              <View className="items-center">
                {/* Growth Icon */}
                <GrowthIcon
                  stage={stats.growthStage.id}
                  size={60}
                  animated={true}
                  glowing={false}
                  onStageChange={handleStageChange}
                />

                {/* Time Counter */}
                {stats.days > 0 ?
                  <Text className="mt-2 text-5xl font-bold text-gray-900 dark:text-white">
                    {stats.days}<Text className='text-lg font-medium'>d</Text>
                  </Text>
                  : null}
                <Text className={`font-bold text-gray-900 dark:text-white ${stats.days > 0 ? 'mt-2 text-2xl' : 'mt-2 text-3xl'}`}>
                  {stats.hours > 0 ? <>{stats.hours.toString().padStart(2, '0')}<Text className='text-base font-medium'>h</Text></> : null} {stats.minutes.toString().padStart(2, '0')}<Text className='text-base font-medium'>m</Text> {stats.seconds.toString().padStart(2, '0')}<Text className='text-base font-medium'>s</Text>
                </Text>
              </View>
            </CircularProgress>
          </View>
        </View>

        {/* Stats Summary Cards - 2x2 Grid */}
        <View className="px-6 mb-6">
          {/* First Row */}
          <View className="flex-row gap-4 mb-4">
            {/* Total Attempts */}
            <View className="flex-1 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
                Total Attempts
              </Text>
              <Text className="text-3xl font-semibold text-emerald-900 dark:text-emerald-100">
                {stats.totalAttempts}
              </Text>
            </View>

            {/* Best Streak */}
            <View className="flex-1 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide uppercase text-amber-600 dark:text-amber-400">
                Best Streak
              </Text>
              <Text className="text-3xl font-semibold text-amber-900 dark:text-amber-100">
                {stats.bestStreak}
                <Text className="text-xs font-medium text-amber-600 dark:text-amber-400"> days</Text>
              </Text>
            </View>
          </View>

          {/* Second Row - Urge Stats */}
          <View className="flex-row gap-4">
            {/* Urges Resisted */}
            <View className="flex-1 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400">
                Urges Resisted
              </Text>
              <Text className="text-3xl font-semibold text-blue-900 dark:text-blue-100">
                {userStats.urgesResisted}
              </Text>
            </View>

            {/* Resistance Rate */}
            <View className="flex-1 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide text-purple-600 uppercase dark:text-purple-400">
                Success Rate
              </Text>
              <Text className="text-3xl font-semibold text-purple-900 dark:text-purple-100">
                {userStats.resistanceRate}
                <Text className="text-xs font-medium text-purple-600 dark:text-purple-400">%</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 px-6 mb-6">
          {/* Log Urge Resisted Button */}
          <Pressable
            onPress={handleUrgePress}
            className="flex-row items-center justify-center w-full gap-2 py-4 bg-blue-600 dark:bg-blue-700 rounded-2xl active:bg-blue-700 dark:active:bg-blue-800"
          >
            <Shield size={22} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-lg font-semibold text-center text-white">
              I Resisted an Urge
            </Text>
          </Pressable>

          {/* Record Relapse Button */}
          <Pressable
            onPress={handleRelapsePress}
            className="w-full py-4 bg-emerald-600 dark:bg-emerald-700 rounded-2xl active:bg-emerald-700 dark:active:bg-emerald-800"
          >
            <Text className="text-lg font-semibold text-center text-white">
              Record Relapse
            </Text>
          </Pressable>

          {/* Emergency Help Button */}
          <Pressable
            onPress={handleHelpPress}
            className="w-full py-3.5 bg-rose-500 dark:bg-rose-600 rounded-2xl active:bg-rose-600 dark:active:bg-rose-700 flex-row items-center justify-center gap-2"
          >
            <Heart size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-base font-semibold text-center text-white">
              Need Help Now?
            </Text>
          </Pressable>
          <Text className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-1">
            Stoic wisdom & guidance when you need it
          </Text>
        </View>

        {/* Motivation Section */}
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
