import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { router } from 'expo-router';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { getJourneyStart } from '../../src/db/helpers';
import ViewToggle from '../../src/components/ViewToggle';
import HistoryStats from '../../src/components/HistoryStats';
import HistoryList from '../../src/components/HistoryList';
import HistoryCalendar from '../../src/components/HistoryCalendar';
import CalendarRelapseDetails from '../../src/components/CalendarRelapseDetails';
import { BarChart3 } from 'lucide-react-native';

type ViewMode = 'list' | 'calendar';

export default function HistoryScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <Text className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">History</Text>
      </View>

      {/* View Toggle */}
      <View className="px-6 py-4">
        <HistoryStats streak={stats.streak} total={stats.total} />

        {/* Insights Button */}
        <TouchableOpacity
          onPress={() => router.push('/insights')}
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
        <View className="flex-1">
          <HistoryCalendar
            relapses={relapses}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            journeyStart={journeyStart}
          />
          <CalendarRelapseDetails selectedDate={selectedDate} relapses={relapses} />
        </View>
      )}
    </View>
  );
}
