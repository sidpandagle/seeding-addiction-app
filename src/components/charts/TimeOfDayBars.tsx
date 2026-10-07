import { View, Text } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { barTint } from '../../constants/palette';

export interface TimeOfDayRow {
  period: string;
  timeRange: string;
  icon: string;
  count: number;
}

interface TimeOfDayBarsProps {
  rows: TimeOfDayRow[];
  /** Period drawn in the full accent color, usually the busiest one */
  highlight?: string;
  accent: 'relapse' | 'primary';
}

// Full class names so Tailwind picks them up
const ACCENT_TEXT = {
  relapse: 'text-relapse-ink',
  primary: 'text-primary',
} as const;

/**
 * One bar per part of the day: label on the left, count on the right.
 * Used by Time of Day Vulnerability (relapses) and Time Distribution (activities).
 */
export function TimeOfDayBars({ rows, highlight, accent }: TimeOfDayBarsProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const peakColor = colors[accent];
  const baseColor = barTint(peakColor, colors.surface, colorScheme);
  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <View className="gap-3">
      {rows.map((row) => {
        const isHighlight = row.period === highlight && row.count > 0;

        return (
          <View key={row.period} className="flex-row items-center">
            {/* Width in px (spacing classes are 14px rem on native) so the longest label
                clears the bar and every bar starts at the same x */}
            <View className="flex-row items-center w-[108px] gap-2 mr-3">
              <Text className="font-regular text-lg">{row.icon}</Text>
              <View className="shrink">
                <Text
                  className={`text-xs font-semibold ${isHighlight ? ACCENT_TEXT[accent] : 'text-body'}`}
                  numberOfLines={1}
                >
                  {row.period}
                </Text>
                <Text className="font-regular text-xs text-faint" numberOfLines={1}>
                  {row.timeRange}
                </Text>
              </View>
            </View>

            <View className="flex-1 h-6 overflow-hidden bg-subtle rounded-lg">
              <View
                className="h-full rounded-lg"
                style={{
                  width: `${(row.count / maxCount) * 100}%`,
                  backgroundColor: isHighlight ? peakColor : baseColor,
                }}
              />
            </View>

            <Text
              className={`w-8 ml-3 text-sm font-bold text-right ${isHighlight ? ACCENT_TEXT[accent] : 'text-muted'}`}
            >
              {row.count}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
