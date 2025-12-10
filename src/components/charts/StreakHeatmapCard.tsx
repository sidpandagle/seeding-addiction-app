import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Grid3X3, Flame } from 'lucide-react-native';
import type { Relapse } from '../../db/schema';
import type { Activity } from '../../db/schema';

interface StreakHeatmapCardProps {
  relapses: Relapse[];
  activities: Activity[];
  journeyStartTime: number | null;
}

interface DayData {
  date: string;
  relapses: number;
  activities: number;
  isClean: boolean;
}

const StreakHeatmapCard: React.FC<StreakHeatmapCardProps> = ({
  relapses,
  activities,
  journeyStartTime,
}) => {
  const heatmapData = useMemo(() => {
    const now = new Date();
    const daysToShow = 90; // Show last 90 days (roughly 3 months)
    const data: DayData[] = [];

    // Create a map for quick lookup
    const relapseMap = new Map<string, number>();
    const activityMap = new Map<string, number>();

    relapses.forEach(r => {
      const dateKey = new Date(r.timestamp).toISOString().split('T')[0];
      relapseMap.set(dateKey, (relapseMap.get(dateKey) || 0) + 1);
    });

    activities.forEach(a => {
      const dateKey = new Date(a.timestamp).toISOString().split('T')[0];
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
    });

    // Generate data for each day
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateKey = date.toISOString().split('T')[0];
      const dayRelapses = relapseMap.get(dateKey) || 0;
      const dayActivities = activityMap.get(dateKey) || 0;

      data.push({
        date: dateKey,
        relapses: dayRelapses,
        activities: dayActivities,
        isClean: dayRelapses === 0,
      });
    }

    return data;
  }, [relapses, activities]);

  // Calculate stats
  const stats = useMemo(() => {
    const cleanDays = heatmapData.filter(d => d.isClean).length;
    const totalActivities = heatmapData.reduce((sum, d) => sum + d.activities, 0);
    const totalRelapses = heatmapData.reduce((sum, d) => sum + d.relapses, 0);

    // Calculate current streak
    let currentStreak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].isClean) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak in the period
    let longestStreak = 0;
    let tempStreak = 0;
    heatmapData.forEach(d => {
      if (d.isClean) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return { cleanDays, totalActivities, totalRelapses, currentStreak, longestStreak };
  }, [heatmapData]);

  const getCellColor = (day: DayData) => {
    if (day.relapses > 0) {
      return 'bg-red-400 dark:bg-red-600';
    }
    if (day.activities >= 3) {
      return 'bg-emerald-500 dark:bg-emerald-600';
    }
    if (day.activities >= 2) {
      return 'bg-emerald-400 dark:bg-emerald-500';
    }
    if (day.activities >= 1) {
      return 'bg-emerald-300 dark:bg-emerald-700';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };

  // Group data by weeks (7 days)
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; position: number }[] = [];
    let lastMonth = -1;

    heatmapData.forEach((day, index) => {
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: new Date(day.date).toLocaleDateString('en-US', { month: 'short' }),
          position: Math.floor(index / 7),
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [heatmapData]);

  if (!journeyStartTime && relapses.length === 0 && activities.length === 0) {
    return (
      <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Grid3X3 size={20} color="#10b981" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Streak Heatmap
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Start tracking to see your progress visualized
        </Text>
      </View>
    );
  }

  return (
    <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
      <View className="flex-row items-center mb-4">
        <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Grid3X3 size={20} color="#10b981" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Streak Heatmap
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Last 90 days of your journey
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row mb-4">
        <View className="flex-1 items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mr-2">
          <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {stats.cleanDays}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Clean Days</Text>
        </View>
        <View className="flex-1 items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mr-2">
          <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {stats.longestStreak}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Best Streak</Text>
        </View>
        <View className="flex-1 items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <View className="flex-row items-center">
            <Flame size={14} color="#f59e0b" strokeWidth={2.5} />
            <Text className="text-lg font-bold text-amber-600 dark:text-amber-400 ml-1">
              {stats.currentStreak}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Current</Text>
        </View>
      </View>

      {/* Heatmap Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month Labels */}
          <View className="flex-row mb-1 ml-6">
            {monthLabels.map((label, i) => (
              <Text
                key={i}
                className="text-xs text-gray-400 dark:text-gray-500"
                style={{ position: 'absolute', left: label.position * 14 }}
              >
                {label.label}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View className="flex-row mt-4">
            {/* Day labels */}
            <View className="mr-1">
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3"></Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3">M</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3"></Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3">W</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3"></Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3">F</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 h-3"></Text>
            </View>

            {/* Cells */}
            <View className="flex-row">
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} className="mr-0.5">
                  {week.map((day, dayIndex) => (
                    <View
                      key={day.date}
                      className={`w-3 h-3 mb-0.5 rounded-sm ${getCellColor(day)}`}
                    />
                  ))}
                  {/* Pad incomplete weeks */}
                  {week.length < 7 &&
                    Array(7 - week.length)
                      .fill(0)
                      .map((_, i) => (
                        <View key={`empty-${i}`} className="w-3 h-3 mb-0.5" />
                      ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-4 gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 mr-1" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">No activity</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700 mr-1" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">1+ activity</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-600 mr-1" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">Relapse</Text>
        </View>
      </View>
    </View>
  );
};

export default StreakHeatmapCard;
