import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Zap, Clock, Shuffle, TrendingUp, Info, X, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse } from '../../db/schema';
import type { Activity } from '../../db/schema';
import { ACTIVITY_CATEGORIES, filterValidCategories } from '../../constants/tags';
import { useCustomActivityTagsStore } from '../../stores/customActivityTagsStore';
import { getAppSetting, setAppSetting } from '../../db/helpers';

const ACTIVITY_CHART_LIMIT_KEY = 'activity_chart_limit';
const LIMIT_OPTIONS = [5, 10, 15, 20, 'all'] as const;
type DisplayLimit = typeof LIMIT_OPTIONS[number];

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
  timeRange: string;
}

// Colors for the donut chart (12 colors for better distinction)
const CHART_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f97316', // orange
  '#84cc16', // lime
  '#14b8a6', // teal
  '#e11d48', // rose
  '#6366f1', // indigo
];

const OTHERS_COLOR = '#9ca3af'; // gray for "Others" slice

const ActivityEffectivenessCard: React.FC<ActivityEffectivenessCardProps> = ({
  relapses,
  activities,
  journeyStartTime,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showInfo, setShowInfo] = useState(false);
  const [displayLimit, setDisplayLimit] = useState<DisplayLimit>(10);
  const [showLimitPicker, setShowLimitPicker] = useState(false);
  const customTags = useCustomActivityTagsStore(state => state.customTags);

  // Load saved display limit preference
  useEffect(() => {
    const loadLimit = async () => {
      const saved = await getAppSetting(ACTIVITY_CHART_LIMIT_KEY);
      if (saved) {
        setDisplayLimit(saved === 'all' ? 'all' : parseInt(saved, 10) as DisplayLimit);
      }
    };
    loadLimit();
  }, []);

  // Save display limit preference
  const handleLimitChange = async (limit: DisplayLimit) => {
    setDisplayLimit(limit);
    await setAppSetting(ACTIVITY_CHART_LIMIT_KEY, String(limit));
    setShowLimitPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
      { period: 'Morning', count: timePatterns.morning, percentage: Math.round((timePatterns.morning / activities.length) * 100), icon: '🌅', timeRange: '5am - 12pm' },
      { period: 'Afternoon', count: timePatterns.afternoon, percentage: Math.round((timePatterns.afternoon / activities.length) * 100), icon: '☀️', timeRange: '12pm - 5pm' },
      { period: 'Evening', count: timePatterns.evening, percentage: Math.round((timePatterns.evening / activities.length) * 100), icon: '🌆', timeRange: '5pm - 9pm' },
      { period: 'Night', count: timePatterns.night, percentage: Math.round((timePatterns.night / activities.length) * 100), icon: '🌙', timeRange: '9pm - 5am' },
    ].sort((a, b) => b.count - a.count);

    // Calculate weekly average
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.timestamp) > thirtyDaysAgo);
    const weeklyAverage = Math.round((recentActivities.length / 4) * 10) / 10;

    // Create display categories with "Others" grouping for chart
    const effectiveLimit = displayLimit === 'all' ? topCategories.length : displayLimit;
    const displayCategories = topCategories.slice(0, effectiveLimit);
    const otherCategories = displayLimit === 'all' ? [] : topCategories.slice(effectiveLimit);

    let othersData: CategoryStats | null = null;
    if (otherCategories.length > 0) {
      const othersCount = otherCategories.reduce((sum, c) => sum + c.count, 0);
      othersData = {
        category: `+${otherCategories.length} Others`,
        count: othersCount,
        percentage: Math.round((othersCount / activities.length) * 100),
        color: OTHERS_COLOR,
      };
    }

    return {
      topCategories: displayCategories,
      allCategories: topCategories,
      othersData,
      otherCategories,
      totalCategories: uniqueCategoriesUsed,
      diversityScore,
      timePatterns: timePatternData,
      peakTime: timePatternData[0],
      weeklyAverage,
      totalActivities: activities.length,
    };
  }, [activities, relapses, journeyStartTime, customTags, displayLimit]);

  if (activities.length === 0) {
    return (
      <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-full dark:bg-purple-900/40">
            <Zap size={20} color="#a855f7" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Activity Insights
          </Text>
        </View>
        <Text className="py-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Log activities to see patterns and insights
        </Text>
      </View>
    );
  }

  if (!insights) return null;

  // Prepare donut chart data
  const pieChartData = useMemo(() => {
    if (!insights) return [];

    const data = insights.topCategories.map((stat) => ({
      value: stat.count,
      color: stat.color,
      text: `${stat.percentage}%`,
    }));

    // Add "Others" slice if applicable
    if (insights.othersData) {
      data.push({
        value: insights.othersData.count,
        color: OTHERS_COLOR,
        text: `${insights.othersData.percentage}%`,
      });
    }

    return data;
  }, [insights]);

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-full dark:bg-purple-900/40">
            <Zap size={20} color="#a855f7" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Activity Insights
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Your healthy activity patterns
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Limit Selector */}
          <Pressable
            onPress={() => setShowLimitPicker(true)}
            className="flex-row items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <Text className="mr-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              {displayLimit === 'all' ? 'All' : `Top ${displayLimit}`}
            </Text>
            <ChevronDown size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>
          <Pressable
            onPress={() => setShowInfo(!showInfo)}
            className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full dark:bg-gray-800"
          >
            {showInfo ? (
              <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            ) : (
              <Info size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Info Card */}
      {showInfo && (
        <View className="p-3 mb-4 border border-blue-200 rounded-xl bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <Text className="text-xs font-medium leading-4 text-blue-800 dark:text-blue-200">
            Track your healthy activities to understand your patterns. Diverse activities and consistent timing help build stronger habits!
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      <View className="flex-row gap-2 mb-4">
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
      <View className="mb-4">
        <View className="items-center justify-center py-4">
          <PieChart
            data={pieChartData}
            donut
            radius={90}
            innerRadius={55}
            innerCircleColor={isDark ? '#111827' : '#ffffff'}
            centerLabelComponent={() => (
              <View className="items-center justify-center">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.totalActivities}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  activities
                </Text>
              </View>
            )}
          />
        </View>

        {/* Category Legend */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {insights.topCategories.map((stat) => (
            <View
              key={stat.category}
              className="flex-row items-center px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <View
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300" numberOfLines={1}>
                {stat.category}
              </Text>
              <Text className="ml-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                {stat.count}
              </Text>
            </View>
          ))}
          {insights.othersData && (
            <View className="flex-row items-center px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
              <View className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: OTHERS_COLOR }} />
              <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {insights.othersData.category}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Time Distribution */}
      <View className="p-3 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <Text className="mb-3 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          Time Distribution
        </Text>
        <View className="gap-3">
          {insights.timePatterns.map((pattern) => {
            const isPeak = insights.peakTime?.period === pattern.period && pattern.count > 0;
            const maxCount = Math.max(...insights.timePatterns.map(p => p.count), 1);
            const barWidthPercent = Math.max((pattern.count / maxCount) * 100, 0);

            return (
              <View key={pattern.period} className="flex-row items-center gap-3">
                {/* Icon and label */}
                <View className="flex-row items-center w-24 gap-2">
                  <Text className="text-lg">{pattern.icon}</Text>
                  <View>
                    <Text className={`text-xs font-semibold ${isPeak ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {pattern.period}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {pattern.timeRange}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View className="flex-1 h-6 overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-700">
                  <View
                    className={`h-full rounded-lg ${isPeak ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-blue-400 dark:bg-blue-600'}`}
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </View>

                {/* Count */}
                <View className="items-end w-10">
                  <Text className={`text-sm font-bold ${isPeak ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {pattern.count}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Peak Time */}
      {insights.peakTime.count > 0 && (
        <View className="flex-row items-center p-3 mt-4 mb-0 border bg-amber-100 dark:bg-amber-900/20 rounded-xl border-amber-100 dark:border-amber-700">
          <Clock size={20} color="#f59e0b" strokeWidth={2} />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Peak Activity Time
            </Text>
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              {insights.peakTime.icon} {insights.peakTime.period} ({insights.peakTime.percentage}% of activities)
            </Text>
          </View>
        </View>
      )}

      {/* Limit Picker Modal */}
      <Modal
        visible={showLimitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLimitPicker(false)}
      >
        <Pressable
          onPress={() => setShowLimitPicker(false)}
          className="items-center justify-center flex-1 bg-black/50"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-48 p-4 bg-white dark:bg-gray-900 rounded-2xl"
          >
            <Text className="mb-3 text-sm font-bold text-center text-gray-900 dark:text-white">
              Show Activities
            </Text>
            {LIMIT_OPTIONS.map((option) => (
              <Pressable
                key={String(option)}
                onPress={() => handleLimitChange(option)}
                className={`py-3 px-4 rounded-xl mb-1 ${
                  displayLimit === option
                    ? 'bg-purple-100 dark:bg-purple-900/40'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    displayLimit === option
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option === 'all' ? 'Show All' : `Top ${option}`}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ActivityEffectivenessCard;
