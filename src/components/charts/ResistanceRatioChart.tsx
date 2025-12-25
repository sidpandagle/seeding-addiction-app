import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse, Activity } from '../../db/schema';
import { Sparkles, RotateCcw, Info, X } from 'lucide-react-native';

interface ResistanceRatioChartProps {
  relapses: Relapse[];
  activities: Activity[];
}

export default function ResistanceRatioChart({ relapses, activities }: Readonly<ResistanceRatioChartProps>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showInfo, setShowInfo] = useState(false);

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
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Engagement Ratio</Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your engagement rate: positive activities vs relapses.
          </Text>
        </View>
        <Pressable
          onPress={() => setShowInfo(!showInfo)}
          className="items-center justify-center w-8 h-8 ml-2 bg-gray-100 rounded-full dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
        >
          {showInfo ? (
            <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          ) : (
            <Info size={16} color={isDark ? '#9ca3af' : '#6b7280'} strokeWidth={2.5} />
          )}
        </Pressable>
      </View>

      {/* Info Card */}
      {showInfo && (
        <View className="p-3 mt-2 mb-2 bg-blue-100 border border-blue-100 rounded-xl dark:bg-blue-900/20 dark:border-blue-800">
          <Text className="text-xs font-medium leading-4 text-blue-800 dark:text-blue-200">
            This shows your balance between positive activities and relapses. A 70%+ activity rate shows strong engagement. Focus on logging more growth activities to shift the balance!
          </Text>
        </View>
      )}
      <View className="h-2" />

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
          <View className="items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
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
        <View className="p-3 mt-4 bg-green-100 border border-green-100 dark:bg-green-900/20 dark:border-green-800 rounded-xl">
          <Text className="mb-1 text-xs font-bold text-center text-green-700 dark:text-green-300">
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
        <View className="p-3 mt-4 border border-emerald-100 bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
          <Text className="mb-1 text-xs font-bold text-center text-emerald-700 dark:text-emerald-300">
            ✅ Healthy Balance! You\'re actively engaging in recovery.
          </Text>
          <Text className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 leading-4">
            A balanced approach with regular positive activities helps recovery. Keep logging actions—each one strengthens your new identity!
          </Text>
        </View>
      )}
      {activityPercentage < 40 && totalEvents > 5 && (
        <View className="p-3 mt-4 bg-blue-100 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
          <Text className="mb-1 text-xs font-bold text-center text-blue-700 dark:text-blue-300">
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
