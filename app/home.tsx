import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../src/stores/relapseStore';
import RelapseModal from '../src/components/RelapseModal';
import { getJourneyStart } from '../src/db/helpers';

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
      return { streak: 0, total: 0, lastRelapse: null, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const timeDiff = Math.max(0, currentTime - new Date(startTime).getTime());

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      streak: days,
      total: relapses.length,
      lastRelapse: relapses.length > 0 ? startTime : null,
      days,
      hours,
      minutes,
      seconds,
    };
  }, [relapses, currentTime, journeyStart]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-16 pb-6 px-6 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Seeding</Text>
        <Text className="text-sm text-gray-500 mt-1">Track your progress</Text>
      </View>

      {/* Stats Cards */}
      <View className="px-6 mt-6">
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-sm text-gray-500 uppercase tracking-wide mb-2">
            Current Streak
          </Text>
          <Text className="text-5xl font-bold text-blue-600">
            {stats.days}
          </Text>
          <Text className="text-lg text-gray-600 mt-1">
            {stats.days === 1 ? 'day' : 'days'}
          </Text>

          {/* Live countdown timer */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.days}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">days</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.hours.toString().padStart(2, '0')}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">hours</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.minutes.toString().padStart(2, '0')}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">min</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {stats.seconds.toString().padStart(2, '0')}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">sec</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-sm text-gray-500 uppercase tracking-wide mb-2">
            Total Relapses
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            {stats.total}
          </Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="px-6 mt-6 gap-3">
        <Pressable
          onPress={() => router.push('/relapses')}
          className="bg-white rounded-xl p-4 active:bg-gray-50 flex-row items-center justify-between"
        >
          <Text className="text-lg font-semibold text-gray-900">View History</Text>
          <Text className="text-2xl">📊</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/settings')}
          className="bg-white rounded-xl p-4 active:bg-gray-50 flex-row items-center justify-between"
        >
          <Text className="text-lg font-semibold text-gray-900">Settings</Text>
          <Text className="text-2xl">⚙️</Text>
        </Pressable>
      </View>

      {/* Floating Add Button */}
      <Pressable
        onPress={() => setShowModal(true)}
        className="absolute bottom-8 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:bg-blue-700"
      >
        <Text className="text-white text-3xl font-light">+</Text>
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
