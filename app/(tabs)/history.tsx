import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { getJourneyStart } from '../../src/db/helpers';
import ViewToggle from '../../src/components/ViewToggle';
import HistoryList from '../../src/components/HistoryList';
import HistoryCalendar from '../../src/components/HistoryCalendar';
import CalendarRelapseDetails from '../../src/components/CalendarRelapseDetails';
import InsightsModal from '../../src/components/InsightsModal';
import { BarChart3 } from 'lucide-react-native';

type ViewMode = 'list' | 'calendar';

export default function HistoryScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Load journey start timestamp
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  const stats = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      startTime = journeyStart;
    } else {
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    const elapsedTime = startTime ? Math.max(0, Date.now() - new Date(startTime).getTime()) : 0;
    const daysSinceLastRelapse = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));

    return {
      streak: daysSinceLastRelapse,
      total: relapses.length,
    };
  }, [relapses, journeyStart]);

  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-[#1A1825]">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Minimal Header */}
      <View className="px-6 pt-16 pb-6 bg-white dark:bg-[#252336]">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          History
        </Text>
        <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Track your journey over time
        </Text>
      </View>

      {/* View Controls */}
      <View className="px-6 py-4">
        {/* Insights Button */}
        <TouchableOpacity
          onPress={() => setShowInsightsModal(true)}
          className="flex-row items-center justify-center px-5 py-3.5 mb-4 bg-accent-50 dark:bg-accent-900/20 rounded-2xl"
          activeOpacity={0.7}
        >
          <BarChart3 size={19} color={isDark ? '#AFA6D9' : '#948ACD'} strokeWidth={2.2} />
          <Text className="ml-2 text-sm font-semibold text-accent-700 dark:text-accent-300">
            View Insights
          </Text>
        </TouchableOpacity>

        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </View>

      {/* Content Views */}
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
