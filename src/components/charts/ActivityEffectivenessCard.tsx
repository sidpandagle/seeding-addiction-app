import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Zap, Award, Clock, Shuffle, TrendingUp, Info, X } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse } from '../../db/schema';
import type { Activity } from '../../db/schema';
import { ACTIVITY_CATEGORIES, filterValidCategories } from '../../constants/tags';
import { useCustomActivityTagsStore } from '../../stores/customActivityTagsStore';

interface ActivityEffectivenessCardProps {
  relapses: Relapse[];
  activities: Activity[];
  journeyStartTime: number | null;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface TimePattern {
  period: string;
  count: number;
  percentage: number;
  icon: string;
}

// Colors for the donut chart
const CHART_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f97316', // orange
];

const ActivityEffectivenessCard: React.FC<ActivityEffectivenessCardProps> = ({
  relapses,
  activities,
  journeyStartTime,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showInfo, setShowInfo] = useState(false);
  const customTags = useCustomActivityTagsStore(state => state.customTags);

  // Calculate activity insights
  const insights = useMemo(() => {
    if (activities.length === 0) return null;

    // Count activities by category (only valid/active categories)
    const categoryMap = new Map<string, number>();

    activities.forEach(activity => {
      const categories = activity.categories || [];
      // Filter out deleted custom tags
      const validCategories = filterValidCategories(categories, customTags);
      validCategories.forEach(cat => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });

    // Get top categories sorted by count
    const topCategories: CategoryStats[] = [];
    let colorIndex = 0;
    categoryMap.forEach((count, category) => {
      if (count > 0) {
        topCategories.push({
          category,
          count,
          percentage: Math.round((count / activities.length) * 100),
          color: CHART_COLORS[colorIndex % CHART_COLORS.length],
        });
        colorIndex++;
      }
    });
    topCategories.sort((a, b) => b.count - a.count);

    // Calculate activity diversity (unique categories used / total categories)
    const uniqueCategoriesUsed = topCategories.length;
    const diversityScore = Math.round((uniqueCategoriesUsed / ACTIVITY_CATEGORIES.length) * 100);

    // Analyze time patterns
    const timePatterns: { morning: number; afternoon: number; evening: number; night: number } = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      if (hour >= 5 && hour < 12) timePatterns.morning++;
      else if (hour >= 12 && hour < 17) timePatterns.afternoon++;
      else if (hour >= 17 && hour < 21) timePatterns.evening++;
      else timePatterns.night++;
    });

    const timePatternData: TimePattern[] = [
      { period: 'Morning', count: timePatterns.morning, percentage: Math.round((timePatterns.morning / activities.length) * 100), icon: '🌅' },
      { period: 'Afternoon', count: timePatterns.afternoon, percentage: Math.round((timePatterns.afternoon / activities.length) * 100), icon: '☀️' },
      { period: 'Evening', count: timePatterns.evening, percentage: Math.round((timePatterns.evening / activities.length) * 100), icon: '🌆' },
      { period: 'Night', count: timePatterns.night, percentage: Math.round((timePatterns.night / activities.length) * 100), icon: '🌙' },
    ].sort((a, b) => b.count - a.count);

    // Calculate weekly average
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.timestamp) > thirtyDaysAgo);
    const weeklyAverage = Math.round((recentActivities.length / 4) * 10) / 10;

    return {
      topCategories: topCategories.slice(0, 6),
      totalCategories: uniqueCategoriesUsed,
      diversityScore,
      timePatterns: timePatternData,
      peakTime: timePatternData[0],
      weeklyAverage,
      totalActivities: activities.length,
    };
  }, [activities, relapses, journeyStartTime, customTags]);

  if (activities.length === 0) {
    return (
      <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-100 dark:bg-purple-900/40">
            <Zap size={20} color="#a855f7" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Activity Insights
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Log activities to see patterns and insights
        </Text>
      </View>
    );
  }

  if (!insights) return null;

  // Prepare donut chart data
  const pieData = insights.topCategories.map((stat, index) => ({
    value: stat.count,
    color: stat.color,
    text: `${stat.percentage}%`,
  }));

  // If there are activities without categories, add an "Other" slice
  const categorizedCount = insights.topCategories.reduce((sum, c) => sum + c.count, 0);
  if (categorizedCount < insights.totalActivities) {
    const uncategorized = insights.totalActivities - categorizedCount;
    pieData.push({
      value: uncategorized,
      color: isDark ? '#4B5563' : '#9CA3AF',
      text: `${Math.round((uncategorized / insights.totalActivities) * 100)}%`,
    });
  }

  // Get emoji from category string (first character if it's an emoji)
  const getEmoji = (category: string): string => {
    const firstChar = category.charAt(0);
    // Check if it's an emoji (basic check)
    if (firstChar.charCodeAt(0) > 127) {
      return firstChar;
    }
    return '✨';
  };

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-100 dark:bg-purple-900/40">
            <Zap size={20} color="#a855f7" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Activity Insights
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Your watering patterns
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
            Track your healthy activities to understand your patterns. Diverse activities and consistent timing help build stronger habits!
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      <View className="flex-row mb-4 gap-2">
        <View className="flex-1 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <View className="flex-row items-center gap-1 mb-1">
            <Shuffle size={12} color="#a855f7" />
            <Text className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Diversity
            </Text>
          </View>
          <Text className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {insights.diversityScore}%
          </Text>
          <Text className="text-xs text-purple-500 dark:text-purple-400">
            {insights.totalCategories} types
          </Text>
        </View>
        <View className="flex-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <View className="flex-row items-center gap-1 mb-1">
            <TrendingUp size={12} color="#3b82f6" />
            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Weekly Avg
            </Text>
          </View>
          <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {insights.weeklyAverage}
          </Text>
          <Text className="text-xs text-blue-500 dark:text-blue-400">
            activities
          </Text>
        </View>
      </View>

      {/* Donut Chart */}
      <View className="items-center mb-4">
        <PieChart
          data={pieData}
          donut
          radius={70}
          innerRadius={45}
          innerCircleColor={isDark ? '#111827' : '#ffffff'}
          centerLabelComponent={() => (
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {insights.totalActivities}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                total
              </Text>
            </View>
          )}
          showText={false}
        />
      </View>

      {/* Legend - All Categories Grid */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {insights.topCategories.map((stat) => (
          <View
            key={stat.category}
            className="flex-row items-center px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <View
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: stat.color }}
            />
            <Text className="text-xs text-gray-700 dark:text-gray-300" numberOfLines={1}>
              {stat.category}
            </Text>
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
              {stat.count}
            </Text>
          </View>
        ))}
      </View>

      {/* Peak Time */}
      {insights.peakTime.count > 0 && (
        <View className="flex-row items-center p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <Clock size={20} color="#f59e0b" strokeWidth={2} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Peak Activity Time
            </Text>
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              {insights.peakTime.icon} {insights.peakTime.period} ({insights.peakTime.percentage}% of activities)
            </Text>
          </View>
        </View>
      )}

      {/* Time Distribution */}
      <View className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Time Distribution
        </Text>
        <View className="flex-row justify-between">
          {insights.timePatterns.map((pattern) => (
            <View key={pattern.period} className="items-center">
              <Text className="text-lg">{pattern.icon}</Text>
              <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {pattern.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insight Tip */}
      {insights.diversityScore < 30 && (
        <View className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <Text className="text-xs text-purple-700 dark:text-purple-300">
            💡 Try exploring more activity types! Variety helps build stronger habits.
          </Text>
        </View>
      )}
    </View>
  );
};

export default ActivityEffectivenessCard;
