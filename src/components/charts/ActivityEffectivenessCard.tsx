import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Zap, TrendingUp, Award } from 'lucide-react-native';
import type { Relapse } from '../../db/schema';
import type { Activity } from '../../db/schema';
import { ACTIVITY_CATEGORIES } from '../../constants/tags';

interface ActivityEffectivenessCardProps {
  relapses: Relapse[];
  activities: Activity[];
  journeyStartTime: number | null;
}

interface CategoryStats {
  category: string;
  count: number;
  avgDaysBeforeRelapse: number | null; // null means no relapse followed
  effectivenessScore: number; // 0-100
}

const ActivityEffectivenessCard: React.FC<ActivityEffectivenessCardProps> = ({
  relapses,
  activities,
  journeyStartTime,
}) => {
  const categoryStats = useMemo(() => {
    if (activities.length === 0) return [];

    // Group activities by category
    const categoryMap = new Map<string, {
      count: number;
      daysBeforeRelapse: number[];
      noRelapseFollowed: number;
    }>();

    // Initialize categories
    ACTIVITY_CATEGORIES.forEach(cat => {
      categoryMap.set(cat, { count: 0, daysBeforeRelapse: [], noRelapseFollowed: 0 });
    });

    // Sort relapses by time
    const sortedRelapses = [...relapses].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // For each activity, find if a relapse happened within 7 days after
    activities.forEach(activity => {
      const activityTime = new Date(activity.timestamp).getTime();
      const categories = activity.categories || [];

      categories.forEach(category => {
        const stats = categoryMap.get(category);
        if (!stats) return;

        stats.count++;

        // Find next relapse after this activity
        const nextRelapse = sortedRelapses.find(r => {
          const relapseTime = new Date(r.timestamp).getTime();
          return relapseTime > activityTime;
        });

        if (nextRelapse) {
          const relapseTime = new Date(nextRelapse.timestamp).getTime();
          const daysDiff = (relapseTime - activityTime) / (24 * 60 * 60 * 1000);

          if (daysDiff <= 7) {
            // Relapse happened within 7 days
            stats.daysBeforeRelapse.push(daysDiff);
          } else {
            // Activity was "effective" - no relapse within 7 days
            stats.noRelapseFollowed++;
          }
        } else {
          // No relapse followed this activity at all
          stats.noRelapseFollowed++;
        }

        categoryMap.set(category, stats);
      });
    });

    // Calculate effectiveness scores
    const results: CategoryStats[] = [];

    categoryMap.forEach((stats, category) => {
      if (stats.count === 0) return;

      const avgDays = stats.daysBeforeRelapse.length > 0
        ? stats.daysBeforeRelapse.reduce((a, b) => a + b, 0) / stats.daysBeforeRelapse.length
        : null;

      // Effectiveness = % of times no relapse followed within 7 days
      const effectivenessScore = (stats.noRelapseFollowed / stats.count) * 100;

      results.push({
        category,
        count: stats.count,
        avgDaysBeforeRelapse: avgDays,
        effectivenessScore,
      });
    });

    // Sort by effectiveness score (highest first)
    return results
      .filter(r => r.count >= 1) // Only show categories with at least 1 activity
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, 8); // Show top 8

  }, [relapses, activities]);

  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' };
    if (score >= 60) return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' };
    if (score >= 40) return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' };
    return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' };
  };

  if (activities.length === 0) {
    return (
      <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-100 dark:bg-purple-900/40">
            <Zap size={20} color="#a855f7" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Activity Effectiveness
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Log activities to see which ones help you most
        </Text>
      </View>
    );
  }

  const topActivity = categoryStats.length > 0 ? categoryStats[0] : null;

  return (
    <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
      <View className="flex-row items-center mb-4">
        <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-100 dark:bg-purple-900/40">
          <Zap size={20} color="#a855f7" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Activity Effectiveness
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Which activities help you most
          </Text>
        </View>
      </View>

      {/* Top Performer Highlight */}
      {topActivity && topActivity.effectivenessScore >= 50 && (
        <View className="flex-row items-center p-3 mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <Award size={24} color="#10b981" strokeWidth={2} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Top Performer
            </Text>
            <Text className="text-xs text-emerald-700 dark:text-emerald-300">
              {topActivity.category} has {topActivity.effectivenessScore.toFixed(0)}% effectiveness
            </Text>
          </View>
        </View>
      )}

      {/* Category List */}
      {categoryStats.map((stat, index) => {
        const colors = getEffectivenessColor(stat.effectivenessScore);

        return (
          <View
            key={stat.category}
            className={`py-3 ${index < categoryStats.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                {stat.category}
              </Text>
              <View className={`px-2 py-1 rounded-full ${colors.bg}`}>
                <Text className={`text-xs font-bold ${colors.text}`}>
                  {stat.effectivenessScore.toFixed(0)}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  stat.effectivenessScore >= 80 ? 'bg-emerald-500' :
                  stat.effectivenessScore >= 60 ? 'bg-blue-500' :
                  stat.effectivenessScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${stat.effectivenessScore}%` }}
              />
            </View>

            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {stat.count} activities logged
            </Text>
          </View>
        );
      })}

      {/* Explanation Footer */}
      <View className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          💡 Effectiveness = % of times no relapse occurred within 7 days after doing this activity
        </Text>
      </View>
    </View>
  );
};

export default ActivityEffectivenessCard;
