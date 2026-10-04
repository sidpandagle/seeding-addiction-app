import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useRelapses } from '../../stores/relapseStore';
import { useActivityStore } from '../../stores/activityStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getJourneyStart } from '../../db/helpers';
import WeeklyPatternChart from '../charts/WeeklyPatternChart';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import ResistanceRatioChart from '../charts/ResistanceRatioChart';
import ComparativeStatsCard from '../charts/ComparativeStatsCard';
import ActivityEffectivenessCard from '../charts/ActivityEffectivenessCard';

interface InsightsModalProps {
  onClose: () => void;
}

// Phase 2 Optimization: Memoize component to prevent re-renders when parent updates
const InsightsModal = React.memo(function InsightsModal({ onClose }: InsightsModalProps) {
  const colors = useThemeColors();
  // Phase 2 Optimization: Use granular selector to only subscribe to relapses array
  const relapses = useRelapses();
  const activities = useActivityStore((state) => state.activities);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    const loadJourneyData = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyData();
  }, [relapses]);


  return (
    <View className="flex-1 pb-0 bg-bg">
      {/* Modern Header */}
      <View className="px-6 pt-16 pb-6">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-3xl font-semibold tracking-wide text-fg">Advanced Insights</Text>
            <Text className="mt-1 text-sm font-medium text-primary-ink">
              Detailed analytics and patterns from your journey
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-12 h-12 bg-surface rounded-2xl active:bg-bg"
          >
            <X size={20} color={colors.fg} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pb-6">

        {/* Resistance Ratio Chart */}
        <ResistanceRatioChart relapses={relapses} activities={activities} />

        {/* Weekly Pattern Chart */}
        <WeeklyPatternChart relapses={relapses} />

        {/* Monthly Trend Chart */}
        <MonthlyTrendChart relapses={relapses} />

        {/* Pro Features Section Header */}
        <View className="flex-row items-center mt-3 mb-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="px-4 text-sm font-bold text-primary">
            PRO INSIGHTS
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Comparative Stats */}
        <ComparativeStatsCard relapses={relapses} activities={activities} />

        {/* Activity Effectiveness */}
        <ActivityEffectivenessCard
          relapses={relapses}
          activities={activities}
          journeyStartTime={journeyStart ? new Date(journeyStart).getTime() : null}
        />

        {/* Motivational Message */}
        <View className="p-5 mb-12 bg-surface border border-border rounded-[20px]">
          <Text className="mb-2 text-base font-bold text-fg">
            💪 Remember: Progress isn't linear
          </Text>
          <Text className="font-regular text-sm leading-5 text-muted">
            Every day is a new opportunity to grow stronger. Your journey is unique, and these insights are
            here to help you understand your patterns and celebrate your progress.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});

export default InsightsModal;
