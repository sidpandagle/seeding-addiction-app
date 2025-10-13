import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useUrgeStore } from '../../src/stores/urgeStore';
import { useThemeStore } from '../../src/stores/themeStore';
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
import { Shield, AlertCircle, RotateCcw } from 'lucide-react-native';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import ModalErrorFallback from '../../src/components/ModalErrorFallback';

export default function DashboardScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
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
  
  // Use centralized hook for journey stats
  const stats = useJourneyStats();

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
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-4 pb-5 pt-14 bg-emerald-50 dark:bg-gray-800 text-red-">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 ml-2">
            <Text className="text-2xl font-medium tracking-widest text-gray-900 dark:text-white">Seeding</Text>
            <Text className="text-sm tracking-widest text-gray-600 dark:text-gray-400">Your journey starts here</Text>
          </View>
          <Pressable
            onPress={handleHelpPress}
            // className="items-center justify-center w-12 h-12 bg-rose-500 dark:bg-rose-600 rounded-2xl active:bg-rose-600 dark:active:bg-rose-700"
            className="items-center justify-center w-12 h-12 mr-1"
          >
            <AlertCircle size={30} color="#ef4444" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">

        {/* Stats Cards */}
        <View className="">
          {/* <View className="items-center p-6 mb-4 bg-white shadow-sm rounded-2xl"> */}
          <View className="items-center p-6 mb-0 rounded-2xl">
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
                    ? `Next: ${stats.checkpointProgress.nextCheckpoint.label}`
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

                {/* Time Counter - Now using optimized LiveTimer */}
                {stats.startTime && <LiveTimer startTime={stats.startTime} showDays={true} />}
              </View>
            </CircularProgress>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 px-6 mb-6">
          {/* Log Urge Resisted Button - Positive Action */}
          <Pressable
            onPress={handleUrgePress}
            className="flex-row items-center justify-center w-full gap-2 py-4 mt-0 bg-blue-600 dark:bg-blue-700 rounded-2xl active:bg-blue-700 dark:active:bg-blue-800"
          >
            <Shield size={22} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-lg font-semibold text-center text-white">
              I Resisted an Urge
            </Text>
          </Pressable>

          {/* Record Relapse Button - Neutral Action */}
          <Pressable
            onPress={handleRelapsePress}
            className="flex-row items-center justify-center w-full gap-2 py-4 bg-emerald-600 dark:bg-emerald-700 rounded-2xl active:bg-emerald-700 dark:active:bg-emerald-800"
          >
            <RotateCcw size={22} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-lg font-semibold text-center text-white">
              Record Relapse
            </Text>
          </Pressable>
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
                {userStats.totalAttempts}
              </Text>
            </View>

            {/* Best Streak */}
            <View className="flex-1 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide uppercase text-amber-600 dark:text-amber-400">
                Best Streak
              </Text>
              <Text className="text-3xl font-semibold text-amber-900 dark:text-amber-100">
                {userStats.bestStreak}
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

        

        {/* Motivation Section */}
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
