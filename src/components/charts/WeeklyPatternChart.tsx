import { View, Text, useWindowDimensions, Pressable } from 'react-native';
import { useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { Info, X, Clock } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { calculateWeeklyPattern, calculateTimeOfDayPattern } from '../../utils/chartHelpers';
import type { Relapse } from '../../db/schema';

interface WeeklyPatternChartProps {
  relapses: Relapse[];
}

export default function WeeklyPatternChart({ relapses }: WeeklyPatternChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const [showInfo, setShowInfo] = useState(false);
  const weeklyData = calculateWeeklyPattern(relapses);
  const timeOfDayData = calculateTimeOfDayPattern(relapses);

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
      <View className="flex-row items-start justify-between mb-1">
        <View className='flex flex-col'>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Weekly Pattern</Text>
          <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {relapses.length === 0
              ? 'No data yet. Keep tracking to see your patterns.'
              : 'Which days are most challenging for you?'}
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
        <View className="p-3 mt-0 mb-2 border border-blue-200 rounded-xl bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <Text className="text-xs font-medium leading-4 text-blue-800 dark:text-blue-200">
            This chart shows which days you're most vulnerable. Weekend spikes often mean less structure; weekday peaks may indicate stress. Plan extra support for your challenging days!
          </Text>
        </View>
      )}

      {/* Chart */}
      <View className="items-center py-2">
        <BarChart
          data={chartData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={spacing}
          roundedTop
          // roundedBottom
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
          disableScroll
        />
      </View>

      {/* Time of Day Analysis */}
      {relapses.length > 0 && (
        <View className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center gap-2 mb-4">
            <Clock size={16} color={isDark ? '#9ca3af' : '#6b7280'} strokeWidth={2} />
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              Time of Day Vulnerability
            </Text>
          </View>

          {/* Time period bars */}
          <View className="gap-3">
            {timeOfDayData.data.map((period) => {
              const isHighest = timeOfDayData.mostVulnerable?.period === period.period && period.count > 0;
              const barWidthPercent = relapses.length > 0
                ? Math.max((period.count / Math.max(...timeOfDayData.data.map(d => d.count), 1)) * 100, 0)
                : 0;

              return (
                <View key={period.period} className="flex-row items-center gap-3">
                  {/* Icon and label */}
                  <View className="flex-row items-center w-24 gap-2">
                    <Text className="text-lg">{period.icon}</Text>
                    <View>
                      <Text className={`text-xs font-semibold ${isHighest ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {period.period}
                      </Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {period.timeRange}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View className="flex-1 h-6 overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-800">
                    <View
                      className={`h-full rounded-lg ${isHighest ? 'bg-amber-500 dark:bg-amber-600' : 'bg-blue-400 dark:bg-blue-600'}`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </View>

                  {/* Count */}
                  <View className="items-end w-10">
                    <Text className={`text-sm font-bold ${isHighest ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {period.count}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Danger hours insight */}
          {timeOfDayData.mostVulnerable && timeOfDayData.mostVulnerable.count > 0 && (
            <View className="flex-row items-center gap-2 p-3 mt-4 border rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <Text className="text-base">⚠️</Text>
              <Text className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                Your danger hours are{' '}
                <Text className="font-bold">{timeOfDayData.dangerHours}</Text>
                {' '}({timeOfDayData.mostVulnerable.percentage}% of relapses) and <Text className="font-bold">{weeklyData.reduce((max, day) => (day.count > max.count ? day : max)).day}</Text> is your most challenging day. Plan extra support during this time.
              </Text>
            </View>
          )}
        </View>
      )}

    </View>
  );
}
