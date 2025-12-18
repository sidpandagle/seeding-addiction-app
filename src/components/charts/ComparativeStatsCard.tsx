import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle, Info, X } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse } from '../../db/schema';
import type { Activity as ActivityType } from '../../db/schema';

interface ComparativeStatsCardProps {
  relapses: Relapse[];
  activities: ActivityType[];
}

interface PeriodStats {
  relapses: number;
  activities: number;
  successRate: number;
}

interface Comparison {
  label: string;
  current: PeriodStats;
  previous: PeriodStats;
  periodLabel: { current: string; previous: string };
}

const ComparativeStatsCard: React.FC<ComparativeStatsCardProps> = ({
  relapses,
  activities,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showInfo, setShowInfo] = useState(false);

  const comparisons = useMemo(() => {
    const now = new Date();
    const results: Comparison[] = [];

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

      const total = periodRelapses + periodActivities;
      const successRate = total > 0 ? (periodActivities / total) * 100 : 100;

      return { relapses: periodRelapses, activities: periodActivities, successRate };
    };

    // This Week vs Last Week
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);

    results.push({
      label: 'Weekly',
      current: getStats(thisWeekStart, now),
      previous: getStats(lastWeekStart, lastWeekEnd),
      periodLabel: { current: 'This week', previous: 'Last week' },
    });

    // This Month vs Last Month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    results.push({
      label: 'Monthly',
      current: getStats(thisMonthStart, now),
      previous: getStats(lastMonthStart, lastMonthEnd),
      periodLabel: { current: 'This month', previous: 'Last month' },
    });

    // Last 30 Days vs Previous 30 Days
    const last30DaysStart = new Date(now);
    last30DaysStart.setDate(now.getDate() - 30);
    last30DaysStart.setHours(0, 0, 0, 0);

    const prev30DaysStart = new Date(last30DaysStart);
    prev30DaysStart.setDate(prev30DaysStart.getDate() - 30);

    results.push({
      label: 'Last 30 Days',
      current: getStats(last30DaysStart, now),
      previous: getStats(prev30DaysStart, last30DaysStart),
      periodLabel: { current: 'Last 30 days', previous: 'Previous 30 days' },
    });

    return results;
  }, [relapses, activities]);

  const getTrendIcon = (current: number, previous: number, isLowerBetter: boolean) => {
    if (current === previous) {
      return <Minus size={16} color="#6B7280" strokeWidth={2.5} />;
    }

    const isImproving = isLowerBetter ? current < previous : current > previous;

    if (isImproving) {
      return <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />;
    }
    return <TrendingDown size={16} color="#ef4444" strokeWidth={2.5} />;
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
    if (current === previous) return 'text-gray-500 dark:text-gray-400';
    const isImproving = isLowerBetter ? current < previous : current > previous;
    return isImproving ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };

  if (relapses.length === 0 && activities.length === 0) {
    return (
      <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Activity size={20} color="#3b82f6" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Comparative Stats
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Start tracking to see comparisons over time
        </Text>
      </View>
    );
  }

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Activity size={20} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Comparative Stats
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Track your progress over time
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setShowInfo(!showInfo)}
          className="items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          {showInfo ? (
            <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          ) : (
            <Info size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
        </Pressable>
      </View>

      {/* Info Card */}
      {showInfo && (
        <View className="p-3 mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Text className="text-xs font-medium text-blue-800 dark:text-blue-200 leading-4">
            Compare your progress across different time periods. Green arrows mean improvement (fewer relapses or more activities). Track weekly and monthly trends to see your growth!
          </Text>
        </View>
      )}

      {comparisons.map((comparison, index) => (
        <View
          key={comparison.label}
          className={`${index < comparisons.length - 1 ? 'pb-4 mb-4 border-b border-gray-100 dark:border-gray-800' : ''}`}
        >
          <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            {comparison.label} Comparison
          </Text>

          {/* Relapses Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <AlertCircle size={14} color="#ef4444" strokeWidth={2.5} />
              <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">Relapses</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {comparison.current.relapses} vs {comparison.previous.relapses}
              </Text>
              {getTrendIcon(comparison.current.relapses, comparison.previous.relapses, true)}
              <Text className={`text-xs font-medium ${getChangeColor(comparison.current.relapses, comparison.previous.relapses, true)}`}>
                {getChangeText(comparison.current.relapses, comparison.previous.relapses, true)}
              </Text>
            </View>
          </View>

          {/* Activities Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Activity size={14} color="#10b981" strokeWidth={2.5} />
              <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">Activities</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {comparison.current.activities} vs {comparison.previous.activities}
              </Text>
              {getTrendIcon(comparison.current.activities, comparison.previous.activities, false)}
              <Text className={`text-xs font-medium ${getChangeColor(comparison.current.activities, comparison.previous.activities, false)}`}>
                {getChangeText(comparison.current.activities, comparison.previous.activities, false)}
              </Text>
            </View>
          </View>

          {/* Success Rate Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Success Rate</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {comparison.current.successRate.toFixed(0)}% vs {comparison.previous.successRate.toFixed(0)}%
              </Text>
              {getTrendIcon(comparison.current.successRate, comparison.previous.successRate, false)}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ComparativeStatsCard;
