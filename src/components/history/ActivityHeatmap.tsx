import { memo, useMemo } from 'react';
import { View, Text, Pressable, useWindowDimensions, type GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HistoryEntry } from '../../types/history';
import { getLocalDateString } from '../../utils/dateHelpers';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { mixHex } from '../../constants/palette';

interface ActivityHeatmapProps {
  entries: HistoryEntry[];
  journeyStart: string | null;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

const MAX_WEEKS = 26; // about six months
const MIN_CELL = 10;
const GAP = 3;
// Card margin (mx-6) and padding (p-4) on each side
const HORIZONTAL_CHROME = 2 * 24 + 2 * 16;
const MONTH_ROW_HEIGHT = 18;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Cell {
  date: string;
  wins: number;
  relapse: boolean;
  /** Before the journey started, or later today/this week */
  outside: boolean;
}

/** Wins that day → sage shade (0 = empty) */
function level(wins: number): 0 | 1 | 2 | 3 | 4 {
  if (wins <= 0) return 0;
  return Math.min(wins, 4) as 1 | 2 | 3 | 4;
}

/**
 * The last ~6 months, one square per day (columns are weeks, Sunday on top).
 * Sage gets deeper with more wins logged that day; relapse days are amber.
 * One Pressable for the whole grid keeps ~180 squares cheap; the tap position picks the day.
 */
function ActivityHeatmapComponent({ entries, journeyStart, selectedDate, onDateSelect }: ActivityHeatmapProps) {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const { width } = useWindowDimensions();

  // As many weeks as fit at the minimum square size, up to six months
  const available = width - HORIZONTAL_CHROME;
  const weeks = Math.max(8, Math.min(MAX_WEEKS, Math.floor((available + GAP) / (MIN_CELL + GAP))));
  const cell = Math.floor((available - GAP * (weeks - 1)) / weeks);

  const { columns, months, winDays, relapseDays } = useMemo(() => {
    const wins = new Map<string, number>();
    const relapses = new Set<string>();
    for (const e of entries) {
      const day = getLocalDateString(e.data.timestamp);
      if (e.type === 'relapse') relapses.add(day);
      else wins.set(day, (wins.get(day) ?? 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // First column starts on a Sunday, so the last column holds this week
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);
    const startDay = journeyStart ? new Date(journeyStart) : null;
    startDay?.setHours(0, 0, 0, 0);

    const cols: Cell[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    let winCount = 0;
    let relapseCount = 0;
    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        // Step by calendar days (not 24 h blocks, which drift across daylight-saving changes)
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + w * 7 + d);
        date.setHours(12, 0, 0, 0);
        const key = getLocalDateString(date.toISOString());
        const outside = date > new Date(today.getTime() + DAY_MS - 1) || (!!startDay && date < startDay);
        const cellWins = wins.get(key) ?? 0;
        const relapse = relapses.has(key);
        if (!outside && cellWins > 0) winCount++;
        if (!outside && relapse) relapseCount++;
        col.push({ date: key, wins: cellWins, relapse, outside });
        if (date.getDate() === 1 || (w === 0 && d === 0)) {
          monthLabels.push({ col: w, label: date.toLocaleDateString('en-US', { month: 'short' }) });
        }
      }
      cols.push(col);
    }
    // The first column's label would collide with a month starting a column or two later
    if (monthLabels.length > 1 && monthLabels[1].col - monthLabels[0].col < 3) monthLabels.shift();
    return { columns: cols, months: monthLabels, winDays: winCount, relapseDays: relapseCount };
  }, [entries, journeyStart, weeks]);

  const shades = useMemo(
    () => [
      colors.subtle,
      mixHex(colors.primary, 40, colors.surface),
      mixHex(colors.primary, 60, colors.surface),
      mixHex(colors.primary, 80, colors.surface),
      colors.primary,
    ],
    [colors]
  );
  const todayKey = getLocalDateString(new Date().toISOString());

  const handlePress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const w = Math.floor(locationX / (cell + GAP));
    const d = Math.floor((locationY - MONTH_ROW_HEIGHT) / (cell + GAP));
    const picked = columns[w]?.[d];
    if (!picked || picked.outside) return;
    Haptics.selectionAsync();
    onDateSelect(picked.date === selectedDate ? null : picked.date);
  };

  const gridWidth = weeks * cell + (weeks - 1) * GAP;
  const label = weeks >= MAX_WEEKS ? 'Last 6 months' : `Last ${weeks} weeks`;

  return (
    <View style={cardShadow} className="mx-6 mt-4 rounded-[20px]">
      <View className="p-4 border bg-surface border-border rounded-[20px]">
        <View className="flex-row items-baseline justify-between mb-3">
          <Text className="text-base font-bold text-fg">{label}</Text>
          <Text className="font-regular text-sm text-muted">
            {winDays} win {winDays === 1 ? 'day' : 'days'} · {relapseDays} relapse {relapseDays === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${winDays} days with a win, ${relapseDays} relapse days. Tap a day to see what happened.`}
          style={{ width: gridWidth }}
        >
          {/* Month names over the column where each month starts.
              pointerEvents none: on Android the tap position is relative to the touched child,
              so the squares must let touches through to this Pressable */}
          <View style={{ height: MONTH_ROW_HEIGHT }} pointerEvents="none">
            {months.map((m) => (
              <Text
                key={`${m.col}-${m.label}`}
                className="font-regular absolute text-xs text-muted"
                style={{ left: m.col * (cell + GAP) }}
              >
                {m.label}
              </Text>
            ))}
          </View>
          <View className="flex-row" style={{ gap: GAP }} pointerEvents="none">
            {columns.map((col, w) => (
              <View key={w} style={{ gap: GAP }}>
                {col.map((c) => {
                  const isToday = c.date === todayKey;
                  const isSelected = c.date === selectedDate;
                  return (
                    <View
                      key={c.date}
                      style={{
                        width: cell,
                        height: cell,
                        borderRadius: 3,
                        backgroundColor: c.outside ? 'transparent' : c.relapse ? colors.relapseSoft : shades[level(c.wins)],
                        borderWidth: isSelected ? 2 : c.relapse || isToday ? 1.5 : 0,
                        borderColor: isSelected ? colors.fg : c.relapse ? colors.relapse : colors.muted,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </Pressable>

        {/* Legend */}
        <View className="flex-row flex-wrap items-center justify-between gap-2 mt-3">
          <View className="flex-row items-center gap-1">
            <Text className="font-regular mr-1 text-xs text-muted">Fewer wins</Text>
            {shades.map((shade) => (
              <View key={shade} style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: shade }} />
            ))}
            <Text className="font-regular ml-1 text-xs text-muted">More</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: colors.relapseSoft, borderWidth: 1.5, borderColor: colors.relapse }}
            />
            <Text className="font-regular text-xs text-muted">Relapse</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export const ActivityHeatmap = memo(ActivityHeatmapComponent);
