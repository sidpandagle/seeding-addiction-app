import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useThemeStore } from '../../src/stores/themeStore';
import RelapseModal from '../../src/components/RelapseModal';
import UrgeModal from '../../src/components/UrgeModal';
import EmergencyHelpModal from '../../src/components/EmergencyHelpModal';
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
import { Shield, AlertCircle, RotateCcw } from 'lucide-react-native';

export default function DashboardScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [showModal, setShowModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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

  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-[#1A1825]">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Minimal Header */}
      <View className="px-6 pb-6 pt-16 bg-white dark:bg-[#252336]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Your Journey
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              One moment at a time
            </Text>
          </View>
          <Pressable
            onPress={handleHelpPress}
            className="items-center justify-center w-11 h-11 rounded-2xl bg-warm-50 dark:bg-warm-900/30 active:bg-warm-100 dark:active:bg-warm-900/50"
          >
            <AlertCircle size={22} color={isDark ? '#F2AB7D' : '#E89463'} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Main Progress Section */}
        <View className="px-6 py-8">
          <View className="items-center">
            
            {/* Circular Progress */}
            <CircularProgress
              size={260}
              strokeWidth={12}
              progress={stats.checkpointProgress?.progress ?? 0}
              useGradient={true}
              gradientColors={['#6B9A7F', '#8FB79C']}
              backgroundColor={isDark ? '#2F2D42' : '#F5F5F5'}
              showCheckpoint={false}
            >
              <View className="items-center">
                {/* Growth Icon */}
                <GrowthIcon
                  stage={stats.growthStage.id}
                  size={48}
                  animated={true}
                  glowing={false}
                  onStageChange={handleStageChange}
                />

                {/* Time Counter */}
                {stats.days > 0 && (
                  <Text className="mt-3 text-5xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                    {stats.days}
                    <Text className='text-lg font-medium text-neutral-400 dark:text-neutral-500'>d</Text>
                  </Text>
                )}
                <Text className={`font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight ${stats.days > 0 ? 'mt-1 text-xl' : 'mt-3 text-3xl'}`}>
                  {stats.hours > 0 && <>{stats.hours.toString().padStart(2, '0')}<Text className='text-sm font-medium text-neutral-400 dark:text-neutral-500'>h</Text> </>}
                  {stats.minutes.toString().padStart(2, '0')}<Text className='text-sm font-medium text-neutral-400 dark:text-neutral-500'>m</Text> {stats.seconds.toString().padStart(2, '0')}<Text className='text-sm font-medium text-neutral-400 dark:text-neutral-500'>s</Text>
                </Text>
              </View>
            </CircularProgress>

            {/* Checkpoint Label */}
            {stats.checkpointProgress && (
              <View className="mt-6 px-5 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                <Text className="text-xs text-center text-primary-700 dark:text-primary-300 leading-relaxed">
                  {stats.checkpointProgress.isCompleted
                    ? '✨ All milestones achieved'
                    : stats.checkpointProgress.nextCheckpoint
                      ? `Next: ${stats.checkpointProgress.nextCheckpoint.label}`
                      : 'Beginning your journey'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons - Calm and Supportive */}
        <View className="px-6 pb-6 gap-3">
          {/* Log Urge Resisted Button */}
          <Pressable
            onPress={handleUrgePress}
            className="flex-row items-center justify-center py-4 px-6 bg-cool-500 dark:bg-cool-600 rounded-2xl active:bg-cool-600 dark:active:bg-cool-700"
          >
            <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text className="ml-2 text-base font-semibold text-white tracking-wide">
              I Resisted an Urge
            </Text>
          </Pressable>

          {/* Record Relapse Button */}
          <Pressable
            onPress={handleRelapsePress}
            className="flex-row items-center justify-center py-4 px-6 bg-primary-500 dark:bg-primary-600 rounded-2xl active:bg-primary-600 dark:active:bg-primary-700"
          >
            <RotateCcw size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text className="ml-2 text-base font-semibold text-white tracking-wide">
              Record Relapse
            </Text>
          </Pressable>
        </View>

        {/* Stats Grid - Soft and Balanced */}
        <View className="px-6 pb-6">
          {/* First Row */}
          <View className="flex-row gap-3 mb-3">
            {/* Total Attempts */}
            <View className="flex-1 p-5 bg-white dark:bg-[#252336] rounded-2xl">
              <Text className="text-xs font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                Attempts
              </Text>
              <Text className="text-3xl font-semibold text-primary-700 dark:text-primary-300">
                {stats.totalAttempts}
              </Text>
            </View>

            {/* Best Streak */}
            <View className="flex-1 p-5 bg-white dark:bg-[#252336] rounded-2xl">
              <Text className="text-xs font-medium uppercase tracking-wider text-warm-600 dark:text-warm-400 mb-2">
                Best Streak
              </Text>
              <Text className="text-3xl font-semibold text-warm-700 dark:text-warm-300">
                {stats.bestStreak}
                <Text className="text-xs font-medium text-warm-500"> days</Text>
              </Text>
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row gap-3">
            {/* Urges Resisted */}
            <View className="flex-1 p-5 bg-white dark:bg-[#252336] rounded-2xl">
              <Text className="text-xs font-medium uppercase tracking-wider text-cool-600 dark:text-cool-400 mb-2">
                Resisted
              </Text>
              <Text className="text-3xl font-semibold text-cool-700 dark:text-cool-300">
                {userStats.urgesResisted}
              </Text>
            </View>

            {/* Success Rate */}
            <View className="flex-1 p-5 bg-white dark:bg-[#252336] rounded-2xl">
              <Text className="text-xs font-medium uppercase tracking-wider text-accent-600 dark:text-accent-400 mb-2">
                Success
              </Text>
              <Text className="text-3xl font-semibold text-accent-700 dark:text-accent-300">
                {userStats.resistanceRate}
                <Text className="text-xs font-medium text-accent-500">%</Text>
              </Text>
            </View>
          </View>
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
