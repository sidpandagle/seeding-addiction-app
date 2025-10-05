import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRelapseStore } from '../src/stores/relapseStore';
import RelapseModal from '../src/components/RelapseModal';
import CircularProgress from '../src/components/CircularProgress';
import { MotivationCard } from '../src/components/MotivationCard';
import { getJourneyStart } from '../src/db/helpers';
import { getCheckpointProgress } from '../src/utils/checkpointHelpers';
import { getGrowthStage, GrowthStage } from '../src/utils/growthStages';
import GrowthIcon from '../src/components/GrowthIcon';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const relapses = useRelapseStore((state) => state.relapses);
  const previousStageRef = useRef<GrowthStage | null>(null);

  // Load journey start timestamp (reload when relapses change, e.g., after reset)
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      console.log(start);
      setJourneyStart("2025-10-04T05:55:48.620Z");
    };
    loadJourneyStart();
  }, [relapses]);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      // setCurrentTime(Date.now() + (1 * 24 * 60 * 60 * 1000)); // Adjusted for smoother seconds display
      setCurrentTime(Date.now()); // Adjusted for smoother seconds display
    }, 100);

    return () => clearInterval(interval);
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
    };
  }, [relapses, currentTime, journeyStart]);

  // Handle growth stage transitions with haptic feedback
  const handleStageChange = (newStage: GrowthStage) => {
    if (previousStageRef.current && previousStageRef.current !== newStage) {
      // Stage has changed - trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousStageRef.current = newStage;
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pb-4 bg-white border-b border-gray-200 pt-14">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-normal tracking-widest text-gray-900">Seeding</Text>
            <Text className="mt-0 text-sm tracking-wide text-gray-500">Track your progress</Text>
          </View>

          {/* Header Actions */}
          <View className="flex-row gap-4">
            {/* View History Button */}
            <Pressable
              onPress={() => router.push('/relapses')}
              className="items-center active:opacity-60"
            >
              <View className="items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <Text className="text-xl">📊</Text>
              </View>
              <Text className="mt-1 text-xs text-gray-500">History</Text>
            </Pressable>

            {/* Settings Button */}
            <Pressable
              onPress={() => router.push('/settings')}
              className="items-center active:opacity-60"
            >
              <View className="items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <Text className="text-xl">⚙️</Text>
              </View>
              <Text className="mt-1 text-xs text-gray-500">Settings</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="">
        {/* <View className="items-center p-6 mb-4 bg-white shadow-sm rounded-2xl"> */}
        <View className="items-center p-6 mb-4 rounded-2xl">
          <Text className="mb-4 text-sm tracking-wide text-gray-500 uppercase">
            Current Streak
          </Text>

          {/* Circular Progress */}
          <CircularProgress
            size={240}
            strokeWidth={14}
            progress={stats.checkpointProgress?.progress ?? 0}
            useGradient={true}
            gradientColors={['#07b087', '#8ace19']}
            backgroundColor="#E8F5E9"
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
                glowing={true}
                onStageChange={handleStageChange}
              />

              {/* Time Counter */}
              {stats.days > 0 ?
                <Text className="mt-2 text-5xl text-gray-900">
                  {stats.days}<Text className='text-[18px]'>d</Text>
                </Text>
                : null}
              <Text className={` text-gray-900 ${stats.days > 0 ? 'mt-2 text-2xl' : 'mt-2 text-3xl'}`}>
                {stats.hours > 0 ? <>{stats.hours.toString().padStart(2, '0')}<Text className='text-[16px]'>h</Text></> : null} {stats.minutes.toString().padStart(2, '0')}<Text className='text-[16px]'>m</Text> {stats.seconds.toString().padStart(2, '0')}<Text className='text-[16px]'>s</Text>
              </Text>
            </View>
          </CircularProgress>
        </View>
      </View>



      {/* Motivation Section */}
      <MotivationCard />

      {/* Floating Add Button */}
      <Pressable
        onPress={() => setShowModal(true)}
        className="absolute items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg bottom-8 right-6 active:bg-blue-700"
      >
        <Text className="text-3xl font-light text-white">+</Text>
      </Pressable>

      {/* Relapse Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <RelapseModal onClose={() => setShowModal(false)} />
      </Modal>
    </View>
  );
}
