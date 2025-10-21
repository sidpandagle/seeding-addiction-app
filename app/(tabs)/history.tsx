import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, memo, useMemo } from 'react';
import { History, BarChart3 } from 'lucide-react-native';
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
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                History
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-blue-700 dark:text-blue-400">
                Track your journey
              </Text>
            </View>
            <View className="items-center justify-center bg-blue-100 rounded-2xl w-14 h-14 dark:bg-blue-900/30">
              <History size={26} color="#3b82f6" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>

      {/* View Advanced Insights Button */}
      <View className="px-6 pb-0">
        <Pressable
          onPress={() => setShowInsightsModal(true)}
          style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
          className="flex-row items-center justify-between p-5 border border-gray-200 shadow-sm dark:border-gray-800 rounded-2xl"
        >
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center w-12 h-12 bg-blue-100 rounded-full dark:bg-blue-900/30">
              <BarChart3 size={22} color="#3b82f6" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                View Advanced Insights
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {relapses.length >= 2
                  ? 'Detailed patterns & analytics'
                  : 'Start tracking to see insights'}
              </Text>
            </View>
          </View>
        </Pressable>
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
