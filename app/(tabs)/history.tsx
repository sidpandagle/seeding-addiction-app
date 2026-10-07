import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { History, BarChart3 } from 'lucide-react-native';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useActivityStore } from '../../src/stores/activityStore';
import { useColorScheme } from '../../src/stores/themeStore';
import { useThemeColors, useCardShadow } from '../../src/hooks/useThemeColors';
import { getJourneyStart } from '../../src/db/helpers';
import type { Relapse } from '../../src/db/schema';
import ViewToggle, { type HistoryViewMode } from '../../src/components/history/ViewToggle';
import { PageSheet } from '../../src/components/common/PageSheet';
import HistoryList from '../../src/components/history/HistoryList';
import HistoryCalendar from '../../src/components/history/HistoryCalendar';
import CalendarRelapseDetails from '../../src/components/history/CalendarRelapseDetails';
import { GardenView } from '../../src/components/history/GardenView';
import { ActivityHeatmap } from '../../src/components/history/ActivityHeatmap';
import InsightsModal from '../../src/components/history/InsightsModal';
import RelapseModal from '../../src/components/modals/RelapseModal';
import { createRelapseEntry, createActivityEntry, sortHistoryEntries } from '../../src/types/history';
import { computeStreaks } from '../../src/utils/streaks';

function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  // Use specific selectors to prevent re-renders when other store values change
  const relapses = useRelapseStore((state) => state.relapses);
  const activities = useActivityStore((state) => state.activities);
  const loadActivities = useActivityStore((state) => state.loadActivities);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HistoryViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [heatmapDate, setHeatmapDate] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [editingRelapse, setEditingRelapse] = useState<Relapse | null>(null);
  // Load activities when component mounts
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);
  // Load journey start timestamp for calendar and garden
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);
  // Combine relapses and activities into unified history entries
  const historyEntries = useMemo(() => {
    const relapseEntries = relapses.map(createRelapseEntry);
    const activityEntries = activities.map(createActivityEntry);
    return sortHistoryEntries([...relapseEntries, ...activityEntries]);
  }, [relapses, activities]);

  // Streaks for the Garden and the "Ended a N-day streak" line on relapse cards.
  // Recomputed when switching views so the current plant shows its latest length.
  const streaks = useMemo(
    () => computeStreaks(relapses, journeyStart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [relapses, journeyStart, viewMode]
  );
  const endedStreakMs = useMemo(() => {
    const map = new Map<string, number>();
    streaks.forEach((s) => {
      if (s.endedBy) map.set(s.endedBy.id, s.durationMs);
    });
    return map;
  }, [streaks]);

  const handleEditRelapse = useCallback((relapse: Relapse) => setEditingRelapse(relapse), []);

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {/* Elegant Header */}
      <View className="pt-16 pb-2">
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-fg">
                History
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-muted">
                Track your journey
              </Text>
            </View>
            <View className="items-center justify-center bg-info-soft rounded-2xl w-14 h-14">
              <History size={26} color={colors.info} strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>
      {/* View Advanced Insights Button */}
      <View className="px-6 pb-0">
        <Pressable
          onPress={() => {
            setShowInsightsModal(true);
          }}
          style={cardShadow}
          className="flex-row items-center justify-between p-5 border bg-surface border-border rounded-[20px]"
        >
          <View className="flex-row items-center flex-1 gap-3">
            <View className="items-center justify-center w-12 h-12 bg-info-soft rounded-full">
              <BarChart3 size={22} color={colors.info} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-bold text-fg">
                  View Advanced Insights
                </Text>
              </View>
              <Text className="text-sm text-muted font-regular">
                {historyEntries.length >= 2
                  ? 'Detailed patterns & analytics'
                  : 'Start tracking to see insights'}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
      {/* View Toggle */}
      <View className="px-6 mt-6 mb-4">
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </View>
      {/* Content Views */}
      <View className="flex-1">
        {viewMode === 'list' && (
          <HistoryList entries={historyEntries} endedStreakMs={endedStreakMs} onEditRelapse={handleEditRelapse} />
        )}
        {viewMode === 'garden' && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="pt-2 pb-8">
            <GardenView streaks={streaks} onEditRelapse={handleEditRelapse} />
            <ActivityHeatmap
              entries={historyEntries}
              journeyStart={journeyStart}
              selectedDate={heatmapDate}
              onDateSelect={setHeatmapDate}
            />
            {/* Same day details as the Calendar, for the tapped square */}
            {heatmapDate && (
              <View className="mt-4">
                <CalendarRelapseDetails
                  selectedDate={heatmapDate}
                  entries={historyEntries}
                  endedStreakMs={endedStreakMs}
                  onEditRelapse={handleEditRelapse}
                />
              </View>
            )}
          </ScrollView>
        )}
        {viewMode === 'calendar' && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <HistoryCalendar
              entries={historyEntries}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              journeyStart={journeyStart}
            />
            <CalendarRelapseDetails
              selectedDate={selectedDate}
              entries={historyEntries}
              endedStreakMs={endedStreakMs}
              onEditRelapse={handleEditRelapse}
            />
          </ScrollView>
        )}
      </View>

      {/* Insights Modal */}
      <PageSheet visible={showInsightsModal} onClose={() => setShowInsightsModal(false)}>
        <InsightsModal onClose={() => setShowInsightsModal(false)} />
      </PageSheet>

      {/* Edit or delete a relapse */}
      <PageSheet visible={!!editingRelapse} onClose={() => setEditingRelapse(null)}>
        {editingRelapse && (
          <RelapseModal existingRelapse={editingRelapse} onClose={() => setEditingRelapse(null)} />
        )}
      </PageSheet>
    </View>
  );
}
// Memoize to prevent unnecessary re-renders on tab switches
export default memo(HistoryScreen);
