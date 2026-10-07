import { View, Text, useWindowDimensions, Pressable } from 'react-native';
import { useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { Info, X, Clock, TriangleAlert } from 'lucide-react-native';
import { InsightCallout } from './InsightCallout';
import { TimeOfDayBars } from './TimeOfDayBars';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { useColorScheme } from '../../stores/themeStore';
import { barTint } from '../../constants/palette';
import { calculateWeeklyPattern, calculateTimeOfDayPattern } from '../../utils/chartHelpers';
import type { Relapse } from '../../db/schema';

interface WeeklyPatternChartProps {
  relapses: Relapse[];
}

export default function WeeklyPatternChart({ relapses }: WeeklyPatternChartProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const { width: screenWidth } = useWindowDimensions();
  const [showInfo, setShowInfo] = useState(false);
  const weeklyData = calculateWeeklyPattern(relapses);
  const timeOfDayData = calculateTimeOfDayPattern(relapses);
  const busiestDay = weeklyData.reduce((max, day) => (day.count > max.count ? day : max));
  const barColor = barTint(colors.relapse, colors.surface, colorScheme);

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

  // Transform data for Gifted Charts; the busiest day gets the full relapse color
  const chartData = weeklyData.map((data) => ({
    value: data.count,
    label: data.dayShort,
    frontColor: data === busiestDay && data.count > 0 ? colors.relapse : barColor,
    spacing: 2,
    labelWidth: 40,
    labelTextStyle: {
      color: colors.body,
      fontSize: 12,
      fontWeight: '600' as const,
    },
    topLabelComponent: () => (
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          marginBottom: 4,
        }}
      >
        {data.count}
      </Text>
    ),
  }));

  return (
    <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
      <View className="flex-row items-start justify-between mb-1">
        <View className='flex flex-col'>
          <Text className="text-lg font-bold text-fg">Weekly Pattern</Text>
          <Text className="font-regular mb-4 text-sm text-muted">
            {relapses.length === 0
              ? 'No data yet. Keep tracking to see your patterns.'
              : 'Which days are most challenging for you?'}
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
        <InsightCallout icon={Info} className="mb-2">
          This chart shows which days you're most vulnerable. Weekend spikes often mean less structure; weekday peaks may indicate stress. Plan extra support for your challenging days!
        </InsightCallout>
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
          yAxisTextStyle={{ color: colors.faint }}
          noOfSections={3}
          maxValue={Math.max(...weeklyData.map((d) => d.count), 1) + 1}
          isAnimated
          animationDuration={800}
          height={140}
          barBorderRadius={6}
          frontColor={barColor}
          disableScroll
        />
      </View>

      {/* Time of Day Analysis */}
      {relapses.length > 0 && (
        <View className="pt-5 mt-5 border-t border-border">
          <View className="flex-row items-center gap-2 mb-4">
            <Clock size={16} color={colors.muted} strokeWidth={2} />
            <Text className="text-sm font-bold text-fg">
              Time of Day Vulnerability
            </Text>
          </View>

          <TimeOfDayBars
            rows={timeOfDayData.data}
            highlight={timeOfDayData.mostVulnerable?.period}
            accent="relapse"
          />

          {/* Danger hours insight */}
          {timeOfDayData.mostVulnerable && timeOfDayData.mostVulnerable.count > 0 && (
            <InsightCallout icon={TriangleAlert} variant="warning" className="mt-4">
              <Text className="text-sm font-medium text-relapse-ink">
                Your danger hours are{' '}
                <Text className="font-bold">{timeOfDayData.dangerHours}</Text>
                {' '}({timeOfDayData.mostVulnerable.percentage}% of relapses) and <Text className="font-bold">{busiestDay.day}</Text> is your most challenging day. Plan extra support during this time.
              </Text>
            </InsightCallout>
          )}
        </View>
      )}

    </View>
  );
}
