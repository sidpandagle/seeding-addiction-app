import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ChevronDown } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { mixHex } from '../../constants/palette';
import MonthYearPicker, { type YearMonth } from './MonthYearPicker';
import type { HistoryEntry } from '../../types/history';
import { getLocalDateString, getTodayLocalDateString } from '../../utils/dateHelpers';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const toYearMonth = (date: Date): YearMonth => ({ year: date.getFullYear(), month: date.getMonth() });

/** "2026-10-14" -> { year: 2026, month: 9 } */
const parseYearMonth = (dateString: string): YearMonth => ({
  year: Number(dateString.slice(0, 4)),
  month: Number(dateString.slice(5, 7)) - 1,
});

const toCalendarDate = ({ year, month }: YearMonth) => `${year}-${String(month + 1).padStart(2, '0')}-01`;

interface HistoryCalendarProps {
  entries: HistoryEntry[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  journeyStart: string | null;
}

// Phase 2 Optimization: Memoize component to prevent re-renders on parent updates
const HistoryCalendar = React.memo(function HistoryCalendar({
  entries,
  selectedDate,
  onDateSelect,
  journeyStart,
}: HistoryCalendarProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const isDark = colorScheme === 'dark';

  // Month on screen. The library only reads `current` when it mounts, so jumping to another
  // month remounts it (jumpCount) while swipes and arrows just keep visibleMonth in sync.
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>(() => toYearMonth(new Date()));
  const [jumpCount, setJumpCount] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Create marked dates object for the calendar.
  // Relapse days get an amber dot, activity days a green one; days with both show two dots.
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const relapseDot = { key: 'relapse', color: colors.relapse };
    const activityDot = { key: 'activity', color: colors.primary };

    // Group entries by date to handle mixed dates (both relapse and activity on same day)
    const dateGroups: { [key: string]: { hasRelapse: boolean; hasActivity: boolean } } = {};

    entries.forEach((entry) => {
      const dateKey = getLocalDateString(entry.data.timestamp);
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { hasRelapse: false, hasActivity: false };
      }
      if (entry.type === 'relapse') {
        dateGroups[dateKey].hasRelapse = true;
      } else {
        dateGroups[dateKey].hasActivity = true;
      }
    });

    Object.entries(dateGroups).forEach(([dateKey, { hasRelapse, hasActivity }]) => {
      const dots = [];
      if (hasRelapse) dots.push(relapseDot);
      if (hasActivity) dots.push(activityDot);
      marks[dateKey] = { dots, hasRelapse, hasActivity };
    });

    // Mark today
    const today = getTodayLocalDateString();
    if (!marks[today]) {
      marks[today] = {
        dots: [{ key: 'today', color: colors.info }],
      };
    }

    // Mark selected date, tinted by what happened that day
    if (selectedDate) {
      const day = marks[selectedDate];
      const selectedTint = isDark ? 35 : 28;
      let selectedColor: string;
      let selectedTextColor: string;

      if (day?.hasRelapse) {
        selectedColor = mixHex(colors.relapse, selectedTint, colors.surface);
        selectedTextColor = colors.relapseInk;
      } else if (day?.hasActivity) {
        selectedColor = mixHex(colors.primary, selectedTint, colors.surface);
        selectedTextColor = colors.primaryInk;
      } else {
        selectedColor = mixHex(colors.info, selectedTint, colors.surface);
        selectedTextColor = colors.fg;
      }

      marks[selectedDate] = {
        ...day,
        selected: true,
        selectedColor,
        selectedTextColor,
      };
    }

    return marks;
  }, [entries, selectedDate, isDark, colors]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      onDateSelect(day.dateString);
    },
    [onDateSelect]
  );

  const handleMonthChange = useCallback((month: DateData) => {
    setVisibleMonth(parseYearMonth(month.dateString));
  }, []);

  const jumpTo = useCallback((target: YearMonth) => {
    setVisibleMonth(target);
    setJumpCount((count) => count + 1);
    setPickerOpen(false);
  }, []);

  // Pickable range: from the journey start (or first entry) to the end of next year
  const pickerRange = useMemo(() => {
    const now = new Date();
    let first = now;
    if (journeyStart) {
      first = new Date(journeyStart);
    } else if (entries.length > 0) {
      first = new Date(Math.min(...entries.map((entry) => new Date(entry.data.timestamp).getTime())));
    }
    const min = toYearMonth(first);
    const max = { year: now.getFullYear() + 1, month: 11 };
    return { min, max };
  }, [journeyStart, entries]);

  // The month title doubles as the "jump to" button
  const renderHeader = useCallback(
    (date?: { getFullYear(): number; getMonth(): number }) => {
      if (!date) return null;
      const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
      return (
        <Pressable
          onPress={() => setPickerOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${label}. Choose month and year`}
          className="flex-row items-center gap-1 px-3 py-1 rounded-full active:opacity-60"
        >
          <Text allowFontScaling={false} className="text-xl font-bold text-fg">
            {label}
          </Text>
          <ChevronDown size={20} color={colors.info} strokeWidth={2.5} />
        </Pressable>
      );
    },
    [colors.info]
  );

  const theme = useMemo(
    () => ({
      calendarBackground: colors.surface,
      textSectionTitleColor: colors.muted,
      selectedDayBackgroundColor: colors.info,
      selectedDayTextColor: colors.onPrimary,
      todayTextColor: colors.info,
      dayTextColor: colors.fg,
      textDisabledColor: colors.faint,
      monthTextColor: colors.fg,
      textMonthFontWeight: 'bold' as const,
      textDayFontSize: 18, // Increased from 14
      textMonthFontSize: 20, // Increased from 16
      textDayHeaderFontSize: 14, // Increased from 12
      arrowColor: colors.info,
    }),
    [colors]
  );

  return (
    <View className="px-6 py-4">
      {/* Shadow on the outer view: iOS clips shadows on overflow-hidden views */}
      <View style={cardShadow} className="bg-surface rounded-[20px]">
        <View className="overflow-hidden bg-surface border border-border rounded-[20px]">
          <Calendar
            key={`${colorScheme}-${jumpCount}`} // Remount on theme change or when jumping to a month
            current={toCalendarDate(visibleMonth)}
            onMonthChange={handleMonthChange}
            renderHeader={renderHeader}
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={theme}
            enableSwipeMonths={true}
            // Allow future dates - no restrictions
            maxDate={undefined}
            // Show calendar from journey start or first relapse
            minDate={journeyStart || undefined}
            style={{
              paddingVertical: 18,
              paddingHorizontal: 14,
            }}
          />
        </View>
      </View>

      <MonthYearPicker
        visible={pickerOpen}
        value={visibleMonth}
        min={pickerRange.min}
        max={pickerRange.max}
        onSelect={jumpTo}
        onToday={() => jumpTo(toYearMonth(new Date()))}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
});

export default HistoryCalendar;
