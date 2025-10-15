import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, memo, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useColorScheme } from '../../src/stores/themeStore';
import { getJourneyStart } from '../../src/db/helpers';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import { calculateUserStats } from '../../src/utils/statsHelpers';
import ViewToggle from '../../src/components/history/ViewToggle';
import HistoryList from '../../src/components/history/HistoryList';
import HistoryCalendar from '../../src/components/history/HistoryCalendar';
import CalendarRelapseDetails from '../../src/components/history/CalendarRelapseDetails';
import InsightsModal from '../../src/components/history/InsightsModal';
import { BarChart3 } from 'lucide-react-native';

type ViewMode = 'list' | 'calendar';

function HistoryScreen() {
  const colorScheme = useColorScheme();
  const { relapses } = useRelapseStore();
  const stats = useJourneyStats();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Load journey start timestamp for calendar
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  // Calculate user stats for current streak
  const userStats = useMemo(
    () => calculateUserStats(relapses, stats.startTime),
    [relapses, stats.startTime]
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-2">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
                History
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-blue-700 dark:text-blue-400">
                Track your journey & insights
              </Text>
            </View>

            {/* Insights Button */}
            <Pressable
              onPress={() => setShowInsightsModal(true)}
              className="items-center justify-center bg-blue-100 w-14 h-14 dark:bg-blue-900/30 rounded-2xl active:scale-95"
            >
              <BarChart3 size={26} color="#3b82f6" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Stats Summary Cards */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 p-4 bg-white dark:bg-gray-900 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Total Events
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {relapses.length}
              </Text>
            </View>
            <View className="flex-1 p-4 bg-white dark:bg-gray-900 rounded-2xl">
              <Text className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Current Streak
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.currentStreak}
                </Text>
                <Text className="text-sm font-medium text-blue-500">days</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* View Toggle */}
      <View className="px-6 mt-6 mb-2">
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </View>

      {/* Content Views */}
      <View className="flex-1">
        {viewMode === 'list' ? (
          <HistoryList relapses={relapses} />
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <HistoryCalendar
              relapses={relapses}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              journeyStart={journeyStart}
            />
            <CalendarRelapseDetails selectedDate={selectedDate} relapses={relapses} />
          </ScrollView>
        )}
      </View>

      {/* Insights Modal */}
      <Modal
        visible={showInsightsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsightsModal(false)}
      >
        <InsightsModal onClose={() => setShowInsightsModal(false)} />
      </Modal>
    </View>
  );
}

// Memoize to prevent unnecessary re-renders on tab switches
export default memo(HistoryScreen);
