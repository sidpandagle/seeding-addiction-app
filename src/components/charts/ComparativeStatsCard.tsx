import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle, Info, X } from 'lucide-react-native';
import { InsightCallout } from './InsightCallout';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { useReducedMotion, ANIMATION_PRESETS } from '../../hooks/useReducedMotion';
import type { Relapse } from '../../db/schema';
import type { Activity as ActivityType } from '../../db/schema';

interface ComparativeStatsCardProps {
  relapses: Relapse[];
  activities: ActivityType[];
}

interface PeriodStats {
  relapses: number;
  activities: number;
}

interface Comparison {
  id: string;
  label: string;
  current: PeriodStats;
  previous: PeriodStats;
  periodLabel: { current: string; previous: string };
}

const ComparativeStatsCard: React.FC<ComparativeStatsCardProps> = ({
  relapses,
  activities,
}) => {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const reducedMotion = useReducedMotion();
  const [showInfo, setShowInfo] = useState(false);

  // Calculate all periods at once
  const comparisons = useMemo(() => {
    const now = new Date();

    // Helper to get stats for a date range
    const getStats = (startDate: Date, endDate: Date): PeriodStats => {
      const periodRelapses = relapses.filter(r => {
        const date = new Date(r.timestamp);
        return date >= startDate && date < endDate;
      }).length;

      const periodActivities = activities.filter(a => {
        const date = new Date(a.timestamp);
        return date >= startDate && date < endDate;
      }).length;

      return { relapses: periodRelapses, activities: periodActivities };
    };

    // Calculate all three periods
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const last30DaysStart = new Date(now);
    last30DaysStart.setDate(now.getDate() - 30);
    last30DaysStart.setHours(0, 0, 0, 0);
    const prev30DaysStart = new Date(last30DaysStart);
    prev30DaysStart.setDate(prev30DaysStart.getDate() - 30);

    return [
      {
        id: 'weekly',
        label: 'Weekly',
        current: getStats(thisWeekStart, now),
        previous: getStats(lastWeekStart, lastWeekEnd),
        periodLabel: { current: 'This week', previous: 'Last week' },
      },
      {
        id: 'monthly',
        label: 'Monthly',
        current: getStats(thisMonthStart, now),
        previous: getStats(lastMonthStart, lastMonthEnd),
        periodLabel: { current: 'This month', previous: 'Last month' },
      },
      {
        id: 'last30days',
        label: 'Last 30 Days',
        current: getStats(last30DaysStart, now),
        previous: getStats(prev30DaysStart, last30DaysStart),
        periodLabel: { current: 'Last 30 days', previous: 'Previous 30 days' },
      },
    ];
  }, [relapses, activities]);

  const getTrendIcon = (current: number, previous: number, isLowerBetter: boolean) => {
    if (current === previous) {
      return <Minus size={16} color={colors.muted} strokeWidth={2.5} />;
    }

    const isImproving = isLowerBetter ? current < previous : current > previous;

    if (isImproving) {
      return <TrendingUp size={16} color={colors.primary} strokeWidth={2.5} />;
    }
    return <TrendingDown size={16} color={colors.urge} strokeWidth={2.5} />;
  };

  const getChangeText = (current: number, previous: number, isLowerBetter: boolean) => {
    if (previous === 0 && current === 0) return 'No change';
    if (previous === 0) return isLowerBetter ? `+${current}` : `+${current}`;

    const change = current - previous;
    const percentChange = Math.abs((change / previous) * 100).toFixed(0);

    if (change === 0) return 'No change';

    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change} (${percentChange}%)`;
  };

  const getChangeColor = (current: number, previous: number, isLowerBetter: boolean) => {
    if (current === previous) return 'text-muted';
    const isImproving = isLowerBetter ? current < previous : current > previous;
    return isImproving ? 'text-primary' : 'text-urge';
  };

  if (relapses.length === 0 && activities.length === 0) {
    return (
      <Animated.View
        entering={reducedMotion ? undefined : FadeInDown.duration(ANIMATION_PRESETS.card.duration)}
        style={cardShadow}
          className="p-5 mb-4 bg-surface border border-border rounded-[20px]"
      >
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-info-soft">
            <Activity size={20} color={colors.info} />
          </View>
          <Text className="text-lg font-bold text-fg">
            Comparative Stats
          </Text>
        </View>
        <Text className="font-regular text-sm text-muted text-center py-4">
          Start tracking to see comparisons over time
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(ANIMATION_PRESETS.card.duration)}
      style={cardShadow}
          className="p-5 mb-4 bg-surface border border-border rounded-[20px]"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-info-soft">
            <Activity size={20} color={colors.info} />
          </View>
          <View>
            <Text className="text-lg font-bold text-fg">
              Comparative Stats
            </Text>
            <Text className="font-regular text-xs text-muted">
              Track your progress over time
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setShowInfo(!showInfo)}
          className="items-center justify-center w-8 h-8 rounded-full bg-subtle"
        >
          {showInfo ? (
            <X size={16} color={colors.muted} />
          ) : (
            <Info size={16} color={colors.muted} />
          )}
        </Pressable>
      </View>

      {/* Info Card */}
      {showInfo && (
        <InsightCallout icon={Info} className="mb-4">
          Compare your progress across different time periods. Green arrows mean improvement (fewer relapses or more activities). Track weekly and monthly trends to see your growth!
        </InsightCallout>
      )}

      {/* Show all comparisons */}
      {comparisons.map((comparison, index) => (
        <View
          key={comparison.label}
          className={`${index < comparisons.length - 1 ? 'pb-4 mb-4 border-b border-border' : ''}`}
        >
          <Text className="text-sm font-bold text-body mb-3">
            {comparison.label} Comparison
          </Text>

          {/* Relapses Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <AlertCircle size={14} color={colors.urge} strokeWidth={2.5} />
              <Text className="font-regular ml-2 text-sm text-muted">Relapses</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-fg">
                {comparison.current.relapses} vs {comparison.previous.relapses}
              </Text>
              {getTrendIcon(comparison.current.relapses, comparison.previous.relapses, true)}
              <Text className={`text-xs font-medium ${getChangeColor(comparison.current.relapses, comparison.previous.relapses, true)}`}>
                {getChangeText(comparison.current.relapses, comparison.previous.relapses, true)}
              </Text>
            </View>
          </View>

          {/* Activities Row (the wins vs relapses ratio lives in the Engagement Ratio chart) */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Activity size={14} color={colors.primary} strokeWidth={2.5} />
              <Text className="font-regular ml-2 text-sm text-muted">Activities</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-fg">
                {comparison.current.activities} vs {comparison.previous.activities}
              </Text>
              {getTrendIcon(comparison.current.activities, comparison.previous.activities, false)}
              <Text className={`text-xs font-medium ${getChangeColor(comparison.current.activities, comparison.previous.activities, false)}`}>
                {getChangeText(comparison.current.activities, comparison.previous.activities, false)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

export default ComparativeStatsCard;
