import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import { BarChart3, BookOpen, TrendingUp } from 'lucide-react-native';

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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-4 bg-blue-50 dark:bg-gray-900">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-widest text-gray-900 dark:text-white">
                History
              </Text>
              <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                Track your journey & insights
              </Text>
            </View>
            <View className="items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <BookOpen size={24} color="#3b82f6" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>

      {/* Insights Button */}
      <View className="px-6 mt-4">
        <Pressable
          onPress={() => setShowInsightsModal(true)}
          className="flex-row items-center justify-center px-4 py-4 border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-800 rounded-2xl active:scale-95"
        >
          <View className="items-center justify-center w-10 h-10 mr-3 bg-white border rounded-full border-emerald-200 dark:bg-gray-800 dark:border-emerald-700">
            <BarChart3 size={20} color="#10b981" strokeWidth={2.5} />
          </View>
          <Text className="text-base font-bold text-emerald-700 dark:text-emerald-300">
            View Advanced Insights
          </Text>
          <View className="flex-row items-center ml-2">
            <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />
          </View>
        </Pressable>
      </View>

      {/* View Toggle */}
      <View className="px-6 mt-4">
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
        <ErrorBoundary fallback={<ModalErrorFallback onClose={() => setShowInsightsModal(false)} />}>
          <InsightsModal onClose={() => setShowInsightsModal(false)} />
        </ErrorBoundary>
      </Modal>
    </View>
  );
}
