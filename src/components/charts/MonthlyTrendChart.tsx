import { View, Text, useWindowDimensions, Pressable } from 'react-native';
import { useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { Info } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { calculateMonthlyTrend } from '../../utils/chartHelpers';
import type { Relapse } from '../../db/schema';
import ChartExplanationModal from './ChartExplanationModal';

interface MonthlyTrendChartProps {
  relapses: Relapse[];
}

export default function MonthlyTrendChart({ relapses }: MonthlyTrendChartProps) {
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const [showExplanation, setShowExplanation] = useState(false);
  const monthlyData = calculateMonthlyTrend(relapses, 6);

  // Calculate dynamic chart width (account for container padding: 5 * 4 = 20px on each side)
  const chartWidth = screenWidth - 56; // 56px = container padding (20px) + screen padding (16px) on both sides
  const dataPoints = monthlyData.length;
  const spacing = dataPoints > 1 ? (chartWidth - 60) / (dataPoints - 1) : 40;

  // Transform data for Gifted Charts
  const chartData = monthlyData.map((data) => ({
    value: data.count,
    label: data.monthShort,
    labelTextStyle: {
      color: colorScheme === 'dark' ? '#d1d5db' : '#374151',
      fontSize: 11,
      fontWeight: '600' as const,
    },
    dataPointText: String(data.count),
    dataPointLabelComponent: () => (
      <Text
        style={{
          color: colorScheme === 'dark' ? '#10b981' : '#059669',
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: -20,
        }}
      >
        {data.count}
      </Text>
    ),
  }));

  // Calculate trend direction
  const getTrendInfo = () => {
    if (monthlyData.length < 2) return { direction: 'stable', message: 'Not enough data' };

    const firstHalf = monthlyData.slice(0, Math.ceil(monthlyData.length / 2));
    const secondHalf = monthlyData.slice(Math.ceil(monthlyData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length;

    if (secondAvg < firstAvg * 0.8) {
      return { direction: 'improving', message: 'Trending down! Great progress 🎉' };
    } else if (secondAvg > firstAvg * 1.2) {
      return { direction: 'declining', message: 'Needs attention. Stay focused!' };
    }
    return { direction: 'stable', message: 'Maintaining consistency' };
  };

  const trendInfo = getTrendInfo();

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Monthly Trend</Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {relapses.length === 0
              ? 'Start tracking to see your progress over time.'
              : 'Your journey over the last 6 months.'}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowExplanation(true)}
          className="items-center justify-center w-8 h-8 ml-2 bg-gray-100 rounded-full dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Info size={16} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} strokeWidth={2.5} />
        </Pressable>
      </View>
      <View className="h-2" />

      {/* Chart */}
      <View className="items-center py-2">
        <LineChart
          data={chartData}
          width={chartWidth}
          height={140}
          spacing={spacing}
          color={colorScheme === 'dark' ? '#10b981' : '#059669'}
          thickness={3}
          startFillColor={colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.2)'}
          endFillColor={colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.05)'}
          startOpacity={0.9}
          endOpacity={0.1}
          initialSpacing={10}
          noOfSections={3}
          maxValue={Math.max(...monthlyData.map((d) => d.count), 1) + 1}
          yAxisColor={colorScheme === 'dark' ? '#374151' : '#e5e7eb'}
          xAxisColor={colorScheme === 'dark' ? '#374151' : '#e5e7eb'}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af', fontSize: 10 }}
          hideRules
          hideDataPoints={false}
          dataPointsHeight={8}
          dataPointsWidth={8}
          dataPointsColor={colorScheme === 'dark' ? '#10b981' : '#059669'}
          dataPointsRadius={4}
          textShiftY={-8}
          textShiftX={-5}
          textFontSize={10}
          textColor={colorScheme === 'dark' ? '#10b981' : '#059669'}
          areaChart
          curved
          isAnimated
          animationDuration={1000}
          animateOnDataChange
          onDataChangeAnimationDuration={500}
        />
      </View>

      {/* Trend Analysis */}
      {relapses.length > 0 && (
        <View
          className={`flex-row items-center justify-between mt-4 p-3 rounded-xl ${
            trendInfo.direction === 'improving'
              ? 'bg-green-50 dark:bg-green-900/20'
              : trendInfo.direction === 'declining'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-gray-50 dark:bg-gray-800'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              trendInfo.direction === 'improving'
                ? 'text-green-700 dark:text-green-400'
                : trendInfo.direction === 'declining'
                ? 'text-red-700 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-400'
            }`}
          >
            {trendInfo.message}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Total: <Text className="font-bold">{relapses.length}</Text>
          </Text>
        </View>
      )}

      {/* Explanation Modal */}
      <ChartExplanationModal
        visible={showExplanation}
        onClose={() => setShowExplanation(false)}
        chartType="monthly"
      />
    </View>
  );
}
