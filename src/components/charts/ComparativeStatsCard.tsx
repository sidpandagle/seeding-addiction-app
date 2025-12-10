import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle } from 'lucide-react-native';
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

    // Last 7 Days vs Previous 7 Days
    const last7DaysStart = new Date(now);
    last7DaysStart.setDate(now.getDate() - 7);
    last7DaysStart.setHours(0, 0, 0, 0);

    const prev7DaysStart = new Date(last7DaysStart);
    prev7DaysStart.setDate(prev7DaysStart.getDate() - 7);

    results.push({
      label: 'Last 7 Days',
      current: getStats(last7DaysStart, now),
      previous: getStats(prev7DaysStart, last7DaysStart),
      periodLabel: { current: 'Last 7 days', previous: 'Previous 7 days' },
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
      <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
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
    <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
      <View className="flex-row items-center mb-4">
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
