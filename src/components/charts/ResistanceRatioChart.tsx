import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse, Activity } from '../../db/schema';
import { Sparkles, RotateCcw } from 'lucide-react-native';

interface ResistanceRatioChartProps {
  relapses: Relapse[];
  activities: Activity[];
}

export default function ResistanceRatioChart({ relapses, activities }: ResistanceRatioChartProps) {
  const colorScheme = useColorScheme();

  const activityCount = activities.length;
  const relapseCount = relapses.length;
  const totalEvents = activityCount + relapseCount;

  // Calculate percentages
  const activityPercentage = totalEvents > 0 ? Math.round((activityCount / totalEvents) * 100) : 0;
  const relapsePercentage = totalEvents > 0 ? Math.round((relapseCount / totalEvents) * 100) : 0;

  // Prepare chart data
  const pieData = [
    {
      value: activityCount,
      color: colorScheme === 'dark' ? '#3b82f6' : '#60a5fa',
      gradientCenterColor: colorScheme === 'dark' ? '#60a5fa' : '#93c5fd',
      text: `${activityPercentage}%`,
    },
    {
      value: relapseCount,
      color: colorScheme === 'dark' ? '#f59e0b' : '#fbbf24',
      gradientCenterColor: colorScheme === 'dark' ? '#fbbf24' : '#fde68a',
      text: `${relapsePercentage}%`,
    },
  ];

  // If no data, show empty state
  if (totalEvents === 0) {
    return (
      <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
        <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Engagement Ratio</Text>
        <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Start tracking activities and relapses to see your engagement rate.
        </Text>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-400 dark:text-gray-500">No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Engagement Ratio</Text>
      <Text className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Your engagement rate: positive activities vs relapses.
      </Text>

      {/* Chart Container */}
      <View className="items-center py-4">
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={60}
          innerCircleColor={colorScheme === 'dark' ? '#111827' : '#ffffff'}
          centerLabelComponent={() => (
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                {activityPercentage}%
              </Text>
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Active
              </Text>
            </View>
          )}
          showText={false}
          showGradient
        />
      </View>

      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-6">
        {/* Activities Logged */}
        <View className="flex-row items-center gap-2">
          <View className="items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <Sparkles size={18} color="#3b82f6" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Activities Logged
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {activityCount}
              </Text>
              <Text className="text-xs font-medium text-blue-500 dark:text-blue-500">
                ({activityPercentage}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Relapses */}
        <View className="flex-row items-center gap-2">
          <View className="items-center justify-center w-10 h-10 bg-amber-100 rounded-full dark:bg-amber-900/30">
            <RotateCcw size={18} color="#f59e0b" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Relapses
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {relapseCount}
              </Text>
              <Text className="text-xs font-medium text-amber-500 dark:text-amber-500">
                ({relapsePercentage}%)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Success Message with Research-Based Thresholds */}
      {activityPercentage >= 60 && (
        <View className="p-3 mt-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-green-700 dark:text-green-300 mb-1">
            {activityPercentage >= 80
              ? '🎉 Outstanding! You\'re highly engaged in positive activities!'
              : '💪 Excellent! You\'re actively building healthy habits!'}
          </Text>
          <Text className="text-[10px] text-center text-green-600 dark:text-green-400 leading-4">
            {activityPercentage >= 80
              ? 'Your 80%+ activity rate shows exceptional engagement. You\'re actively rewiring your brain with healthy actions!'
              : 'A 60%+ activity rate shows strong commitment to positive change. Keep channeling energy into meaningful actions!'}
          </Text>
        </View>
      )}
      {activityPercentage >= 40 && activityPercentage < 60 && (
        <View className="p-3 mt-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-emerald-700 dark:text-emerald-300 mb-1">
            ✅ Healthy Balance! You\'re actively engaging in recovery.
          </Text>
          <Text className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 leading-4">
            A balanced approach with regular positive activities helps recovery. Keep logging actions—each one strengthens your new identity!
          </Text>
        </View>
      )}
      {activityPercentage < 40 && totalEvents > 5 && (
        <View className="p-3 mt-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-blue-700 dark:text-blue-300 mb-1">
            💙 Build Momentum! Every positive action rewires your brain.
          </Text>
          <Text className="text-[10px] text-center text-blue-600 dark:text-blue-400 leading-4">
            Focus on adding more positive activities to your day. Physical exercise, socializing, and creative pursuits all help recovery by replacing old patterns with new, healthy ones.
          </Text>
        </View>
      )}
    </View>
  );
}
