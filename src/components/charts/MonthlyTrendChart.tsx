import { View, Text, useWindowDimensions, Pressable } from 'react-native';
import { useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { Info, X } from 'lucide-react-native';
import { InsightCallout } from './InsightCallout';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { withAlpha } from '../../constants/palette';
import { calculateMonthlyTrend } from '../../utils/chartHelpers';
import type { Relapse } from '../../db/schema';

interface MonthlyTrendChartProps {
  relapses: Relapse[];
}

export default function MonthlyTrendChart({ relapses }: Readonly<MonthlyTrendChartProps>) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const { width: screenWidth } = useWindowDimensions();
  const [showInfo, setShowInfo] = useState(false);
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
      color: colors.body,
      fontSize: 12,
      fontWeight: '600' as const,
    },
    dataPointText: String(data.count),
    dataPointLabelComponent: () => (
      <Text
        style={{
          color: colors.primary,
          fontSize: 11,
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
    <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1">
          <Text className="text-lg font-bold text-fg">Monthly Trend</Text>
          <Text className="font-regular mt-1 text-sm text-muted">
            {relapses.length === 0
              ? 'Start tracking to see your progress over time.'
              : 'Your journey over the last 6 months.'}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowInfo(!showInfo)}
          className="items-center justify-center w-8 h-8 ml-2 bg-subtle rounded-full active:bg-border"
        >
          {showInfo ? (
            <X size={16} color={colors.muted} />
          ) : (
            <Info size={16} color={colors.muted} strokeWidth={2.5} />
          )}
        </Pressable>
      </View>

      {/* Info Card */}
      {showInfo && (
        <InsightCallout icon={Info} className="mt-3 mb-2">
          This chart shows your relapse frequency over 6 months. A downward trend means progress! Don't worry about short-term fluctuations, focus on the overall direction.
        </InsightCallout>
      )}
      <View className="h-2" />

      {/* Chart */}
      <View className="items-center py-2">
        <LineChart
          data={chartData}
          width={chartWidth}
          height={140}
          spacing={spacing}
          color={colors.primary}
          thickness={3}
          startFillColor={withAlpha(colors.primary, colorScheme === 'dark' ? 0.3 : 0.2)}
          endFillColor={withAlpha(colors.primary, 0.05)}
          startOpacity={0.9}
          endOpacity={0.1}
          initialSpacing={10}
          noOfSections={3}
          maxValue={Math.max(...monthlyData.map((d) => d.count), 1) + 1}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: colors.faint, fontSize: 11 }}
          hideRules
          hideDataPoints={false}
          dataPointsHeight={8}
          dataPointsWidth={8}
          dataPointsColor={colors.primary}
          dataPointsRadius={4}
          textShiftY={-8}
          textShiftX={-5}
          textFontSize={10}
          textColor={colors.primary}
          areaChart
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
              ? 'bg-primary-soft'
              : trendInfo.direction === 'declining'
              ? 'bg-urge-soft'
              : 'bg-bg'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              trendInfo.direction === 'improving'
                ? 'text-primary-ink'
                : trendInfo.direction === 'declining'
                ? 'text-urge'
                : 'text-body'
            }`}
          >
            {trendInfo.message}
          </Text>
          <Text className="font-regular text-xs text-muted">
            Total: <Text className="font-bold">{relapses.length}</Text>
          </Text>
        </View>
      )}

    </View>
  );
}
