import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Zap, Clock, Shuffle, TrendingUp, Info, X, ChevronDown } from 'lucide-react-native';
import { InsightCallout } from './InsightCallout';
import { TimeOfDayBars } from './TimeOfDayBars';
import { DonutRing } from './DonutRing';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { CHART_SERIES } from '../../constants/palette';
import type { Relapse } from '../../db/schema';
import type { Activity } from '../../db/schema';
import { ACTIVITY_CATEGORIES, filterValidCategories } from '../../constants/tags';
import { useCustomActivityTagsStore } from '../../stores/customActivityTagsStore';
import { getAppSetting, setAppSetting } from '../../db/helpers';

const ACTIVITY_CHART_LIMIT_KEY = 'activity_chart_limit';
// Legend rows that fit beside the ring; the rest wrap below it
const LEGEND_BESIDE_RING = 5;
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


const ActivityEffectivenessCard: React.FC<ActivityEffectivenessCardProps> = ({
  relapses,
  activities,
  journeyStartTime,
}) => {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  // Garden colors in fixed order; "Others" is a light neutral
  const chartColors = CHART_SERIES[colorScheme];
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

    // Get top categories sorted by count. Colors go by rank so no two slices share one;
    // past the rows beside the ring everything is neutral and shares one slice
    const topCategories: CategoryStats[] = [];
    categoryMap.forEach((count, category) => {
      if (count > 0) {
        topCategories.push({
          category,
          count,
          percentage: Math.round((count / activities.length) * 100),
          color: colors.borderStrong,
        });
      }
    });
    topCategories.sort((a, b) => b.count - a.count);
    topCategories.slice(0, LEGEND_BESIDE_RING).forEach((stat, i) => {
      stat.color = chartColors[i];
    });

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
        color: colors.borderStrong,
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
  }, [activities, relapses, journeyStartTime, customTags, displayLimit, chartColors, colors.borderStrong]);

  // Ring segments and legend rows: top categories, then "Others" in neutral.
  // Must stay above the early returns so the hook order never changes.
  const legend = useMemo(() => {
    if (!insights) return [];
    const rows = insights.topCategories.map((stat) => ({ label: stat.category, count: stat.count, color: stat.color }));
    if (insights.othersData) {
      rows.push({ label: insights.othersData.category, count: insights.othersData.count, color: colors.borderStrong });
    }
    return rows;
  }, [insights, colors.borderStrong]);

  // One slice per colored row, then a single neutral slice for everything below the ring
  const ringSegments = useMemo(() => {
    const rest = legend.slice(LEGEND_BESIDE_RING).reduce((sum, row) => sum + row.count, 0);
    return [
      ...legend.slice(0, LEGEND_BESIDE_RING).map((row) => ({ value: row.count, color: row.color })),
      { value: rest, color: colors.borderStrong },
    ];
  }, [legend, colors.borderStrong]);

  if (activities.length === 0) {
    return (
      <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 bg-plum-soft rounded-full">
            <Zap size={20} color={colors.plum} />
          </View>
          <Text className="text-lg font-bold text-fg">
            Activity Insights
          </Text>
        </View>
        <Text className="font-regular py-4 text-sm text-center text-muted">
          Log activities to see patterns and insights
        </Text>
      </View>
    );
  }

  if (!insights) return null;

  return (
    <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="items-center justify-center w-10 h-10 mr-3 bg-plum-soft rounded-full">
            <Zap size={20} color={colors.plum} />
          </View>
          <View>
            <Text className="text-lg font-bold text-fg">
              Activity Insights
            </Text>
            <Text className="font-regular text-xs text-muted">
              Your healthy activity patterns
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Limit Selector */}
          <Pressable
            onPress={() => setShowLimitPicker(true)}
            className="flex-row items-center px-3 py-1.5 bg-subtle rounded-lg"
          >
            <Text className="mr-1 text-xs font-medium text-body">
              {displayLimit === 'all' ? 'All' : `Top ${displayLimit}`}
            </Text>
            <ChevronDown size={14} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => setShowInfo(!showInfo)}
            className="items-center justify-center w-8 h-8 bg-subtle rounded-full"
          >
            {showInfo ? (
              <X size={16} color={colors.muted} />
            ) : (
              <Info size={16} color={colors.muted} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Info Card */}
      {showInfo && (
        <InsightCallout icon={Info} className="mb-4">
          Track your healthy activities to understand your patterns. Diverse activities and consistent timing help build stronger habits!
        </InsightCallout>
      )}

      {/* Quick Stats */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 p-3 rounded-2xl bg-subtle">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Shuffle size={14} color={colors.plum} strokeWidth={2.5} />
            <Text className="text-xs font-bold tracking-wide uppercase text-muted">
              Diversity
            </Text>
          </View>
          <Text className="text-xl font-bold text-fg">
            {insights.diversityScore}%
          </Text>
          <Text className="font-regular text-sm text-muted">
            {insights.totalCategories} types
          </Text>
        </View>
        <View className="flex-1 p-3 rounded-2xl bg-subtle">
          <View className="flex-row items-center gap-1.5 mb-1">
            <TrendingUp size={14} color={colors.info} strokeWidth={2.5} />
            <Text className="text-xs font-bold tracking-wide uppercase text-muted">
              Weekly Avg
            </Text>
          </View>
          <Text className="text-xl font-bold text-fg">
            {insights.weeklyAverage}
          </Text>
          <Text className="font-regular text-sm text-muted">
            activities
          </Text>
        </View>
      </View>

      {/* Ring on the left, legend on the right; extra categories wrap below */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between py-2 pl-1 pr-2">
          <DonutRing
            trackColor={colors.subtle}
            segments={ringSegments}
            size={140}
            gap={5}
          >
            <Text className="text-3xl font-bold text-fg">{insights.totalActivities}</Text>
            <Text className="text-sm font-semibold text-muted">activities</Text>
          </DonutRing>

          <View className="gap-2.5 ml-5 shrink">
            {legend.slice(0, LEGEND_BESIDE_RING).map((row) => (
              <View key={row.label} className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                <Text className="text-sm font-semibold shrink text-body" numberOfLines={1}>
                  {row.label}
                </Text>
                <Text className="text-sm font-bold text-fg">{row.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {legend.length > LEGEND_BESIDE_RING && (
          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-3">
            {legend.slice(LEGEND_BESIDE_RING).map((row) => (
              <View key={row.label} className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                <Text className="text-sm font-semibold text-body" numberOfLines={1}>
                  {row.label}
                </Text>
                <Text className="text-sm font-bold text-fg">{row.count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Time Distribution */}
      <View className="p-3 border border-border rounded-xl bg-bg">
        <Text className="mb-3 text-xs font-bold tracking-wide text-muted uppercase">
          Time Distribution
        </Text>
        <TimeOfDayBars
          rows={insights.timePatterns}
          highlight={insights.peakTime?.period}
          accent="primary"
        />
      </View>

      {/* Peak Time */}
      {insights.peakTime.count > 0 && (
        <View className="flex-row items-center gap-3 px-3.5 py-3 mt-4 rounded-2xl bg-subtle">
          <View className="items-center justify-center rounded-full w-9 h-9 bg-gold-soft">
            <Clock size={20} color={colors.gold} strokeWidth={2.25} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-fg">
              Peak Activity Time
            </Text>
            <Text className="font-regular text-sm text-body">
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
            className="w-48 p-4 bg-surface rounded-2xl"
          >
            <Text className="mb-3 text-sm font-bold text-center text-fg">
              Show Activities
            </Text>
            {LIMIT_OPTIONS.map((option) => (
              <Pressable
                key={String(option)}
                onPress={() => handleLimitChange(option)}
                className={`py-3 px-4 rounded-xl mb-1 ${
                  displayLimit === option
                    ? 'bg-plum-soft'
                    : 'bg-bg'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    displayLimit === option
                      ? 'text-plum'
                      : 'text-body'
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
