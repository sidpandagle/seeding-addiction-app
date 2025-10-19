import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '../../stores/themeStore';
import type { Relapse, Urge } from '../../db/schema';
import { Shield, RotateCcw } from 'lucide-react-native';

interface ResistanceRatioChartProps {
  relapses: Relapse[];
  urges: Urge[];
}

export default function ResistanceRatioChart({ relapses, urges }: ResistanceRatioChartProps) {
  const colorScheme = useColorScheme();

  const urgeCount = urges.length;
  const relapseCount = relapses.length;
  const totalEvents = urgeCount + relapseCount;

  // Calculate percentages
  const urgePercentage = totalEvents > 0 ? Math.round((urgeCount / totalEvents) * 100) : 0;
  const relapsePercentage = totalEvents > 0 ? Math.round((relapseCount / totalEvents) * 100) : 0;

  // Prepare chart data
  const pieData = [
    {
      value: urgeCount,
      color: colorScheme === 'dark' ? '#3b82f6' : '#60a5fa',
      gradientCenterColor: colorScheme === 'dark' ? '#60a5fa' : '#93c5fd',
      text: `${urgePercentage}%`,
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
        <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Resistance Ratio</Text>
        <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Start tracking urges and relapses to see your success rate.
        </Text>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-400 dark:text-gray-500">No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Resistance Ratio</Text>
      <Text className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Your success rate in resisting urges vs relapses.
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
                {urgePercentage}%
              </Text>
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Success
              </Text>
            </View>
          )}
          showText={false}
          showGradient
        />
      </View>

      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-6">
        {/* Urges Resisted */}
        <View className="flex-row items-center gap-2">
          <View className="items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <Shield size={18} color="#3b82f6" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Urges Resisted
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {urgeCount}
              </Text>
              <Text className="text-xs font-medium text-blue-500 dark:text-blue-500">
                ({urgePercentage}%)
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
      {urgePercentage >= 60 && (
        <View className="p-3 mt-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-green-700 dark:text-green-300 mb-1">
            {urgePercentage >= 80
              ? '🎉 Outstanding! You\'re in the top tier of recovery success!'
              : '💪 Excellent! You\'re above the healthy recovery baseline!'}
          </Text>
          <Text className="text-[10px] text-center text-green-600 dark:text-green-400 leading-4">
            {urgePercentage >= 80
              ? 'Your 80%+ resistance rate shows exceptional progress. Your brain\'s reward system is healing.'
              : 'A 60%+ success rate exceeds the 40-60% baseline for healthy recovery. You\'re doing great!'}
          </Text>
        </View>
      )}
      {urgePercentage >= 40 && urgePercentage < 60 && (
        <View className="p-3 mt-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-emerald-700 dark:text-emerald-300 mb-1">
            ✅ Healthy Progress! You\'re in the normal recovery range.
          </Text>
          <Text className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 leading-4">
            Research shows 40-60% success rate is normal in recovery. You\'re right on track—keep building those gaps between relapses!
          </Text>
        </View>
      )}
      {urgePercentage < 40 && totalEvents > 5 && (
        <View className="p-3 mt-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
          <Text className="text-xs font-bold text-center text-blue-700 dark:text-blue-300 mb-1">
            💙 Keep Building! Every resisted urge rewires your brain.
          </Text>
          <Text className="text-[10px] text-center text-blue-600 dark:text-blue-400 leading-4">
            Your brain is recovering from cheap dopamine overstimulation. Studies show cravings decrease significantly within 4 weeks. Each urge you resist strengthens your natural reward system.
          </Text>
        </View>
      )}
    </View>
  );
}
