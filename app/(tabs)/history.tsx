import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { getJourneyStart } from '../../src/db/helpers';
import { useJourneyStats } from '../../src/hooks/useJourneyStats';
import ViewToggle from '../../src/components/ViewToggle';
import HistoryList from '../../src/components/HistoryList';
import HistoryCalendar from '../../src/components/HistoryCalendar';
import CalendarRelapseDetails from '../../src/components/CalendarRelapseDetails';
import InsightsModal from '../../src/components/InsightsModal';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import ModalErrorFallback from '../../src/components/ModalErrorFallback';
import { BarChart3 } from 'lucide-react-native';

type ViewMode = 'list' | 'calendar';

export default function HistoryScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <Text className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">History</Text>
      </View>

      {/* View Toggle */}
      <View className="px-6 py-2">
        {/* Insights Button */}
        <TouchableOpacity
          onPress={() => setShowInsightsModal(true)}
          className="flex-row items-center justify-center px-4 py-3 my-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
          activeOpacity={0.7}
        >
          <BarChart3 size={20} color="#10b981" strokeWidth={2} />
          <Text className="ml-2 text-base font-semibold text-emerald-600 dark:text-emerald-400">
            View Advanced Insights
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
        <ErrorBoundary fallback={<ModalErrorFallback onClose={() => setShowInsightsModal(false)} />}>
          <InsightsModal onClose={() => setShowInsightsModal(false)} />
        </ErrorBoundary>
      </Modal>
    </View>
  );
}
