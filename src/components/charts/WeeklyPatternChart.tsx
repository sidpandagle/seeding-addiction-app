import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useColorScheme } from '../../stores/themeStore';
import { calculateWeeklyPattern } from '../../utils/chartHelpers';
import type { Relapse } from '../../db/schema';

interface WeeklyPatternChartProps {
  relapses: Relapse[];
}

export default function WeeklyPatternChart({ relapses }: WeeklyPatternChartProps) {
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const weeklyData = calculateWeeklyPattern(relapses);

  // Calculate dynamic bar width and spacing (7 days of the week)
  const chartWidth = screenWidth - 56; // 56px = container padding (20px) + screen padding (16px) on both sides
  const numberOfBars = 7;
  const totalSpacing = chartWidth * 0.15; // 15% of width for spacing
  const barWidth = (chartWidth - totalSpacing) / numberOfBars;
  const spacing = totalSpacing / (numberOfBars + 1);

  // Get current week's date range (Monday to Sunday)
  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise go to Monday

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  const weekRange = getCurrentWeekRange();

  // Transform data for Gifted Charts
  const chartData = weeklyData.map((data) => ({
    value: data.count,
    label: data.dayShort,
    frontColor: colorScheme === 'dark' ? '#3b82f6' : '#60a5fa',
    gradientColor: colorScheme === 'dark' ? '#60a5fa' : '#93c5fd',
    spacing: 2,
    labelWidth: 40,
    labelTextStyle: {
      color: colorScheme === 'dark' ? '#d1d5db' : '#374151',
      fontSize: 11,
      fontWeight: '600' as const,
    },
    topLabelComponent: () => (
      <Text
        style={{
          color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
          fontSize: 10,
          marginBottom: 4,
        }}
      >
        {data.count}
      </Text>
    ),
  }));

  return (
    <View className="p-5 mb-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <View className="flex flex-row items-center gap-3 mb-0">
        <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Weekly Pattern</Text>
        <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {weekRange}
        </Text>
      </View>
      <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {relapses.length === 0
          ? 'No data yet. Keep tracking to see your patterns.'
          : 'Which days are most challenging for you?'}
      </Text>

      {/* Chart */}
      <View className="items-center py-2">
        <BarChart
          data={chartData}
          barWidth={barWidth}
          spacing={spacing}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }}
          noOfSections={3}
          maxValue={Math.max(...weeklyData.map((d) => d.count), 1) + 1}
          isAnimated
          animationDuration={800}
          height={140}
          barBorderRadius={6}
          showGradient
          gradientColor={colorScheme === 'dark' ? '#60a5fa' : '#93c5fd'}
          frontColor={colorScheme === 'dark' ? '#3b82f6' : '#60a5fa'}
        />
      </View>

      {/* Additional Info */}
      {relapses.length > 0 && (
        <View className="flex-row justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Most challenging:{' '}
            <Text className="font-bold text-blue-600 dark:text-blue-400">
              {weeklyData.reduce((max, day) => (day.count > max.count ? day : max)).dayShort}
            </Text>
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Total events: <Text className="font-bold">{relapses.length}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}
