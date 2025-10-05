import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../src/stores/relapseStore';
import RelapseModal from '../src/components/RelapseModal';
import CircularProgress from '../src/components/CircularProgress';
import { MotivationCard } from '../src/components/MotivationCard';
import { getJourneyStart } from '../src/db/helpers';
import { getCheckpointProgress } from '../src/utils/checkpointHelpers';

export default function HomeScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const relapses = useRelapseStore((state) => state.relapses);

  // Load journey start timestamp (reload when relapses change, e.g., after reset)
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, [relapses]);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

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
    };
  }, [relapses, currentTime, journeyStart]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-white border-b border-gray-200">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900">Seeding</Text>
            <Text className="mt-1 text-sm text-gray-500">Track your progress</Text>
          </View>

          {/* Header Actions */}
          <View className="flex-row gap-4">
            {/* Total Relapses Badge */}
            {/* <View className="items-center">
              <View className="px-3 py-1 bg-gray-100 rounded-full">
                <Text className="text-lg font-bold text-gray-900">{stats.total}</Text>
              </View>
              <Text className="mt-1 text-xs text-gray-500">relapses</Text>
            </View> */}

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
      <View className="px-6 mt-6">
        <View className="items-center p-6 mb-4 bg-white shadow-sm rounded-2xl">
          <Text className="mb-4 text-sm tracking-wide text-gray-500 uppercase">
            Current Streak
          </Text>

          {/* Circular Progress */}
          <CircularProgress
            size={180}
            strokeWidth={12}
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
              <Text className="text-5xl font-bold text-gray-900">
                {stats.days}
              </Text>
              <Text className="mt-1 text-base text-gray-500">
                {stats.days === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </CircularProgress>

          {/* Live countdown timer */}
          <View className="w-full pt-4 mt-6 border-t border-gray-100">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.days}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">days</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.hours.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">hours</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.minutes.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">min</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.seconds.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">sec</Text>
              </View>
            </View>
          </View>
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
