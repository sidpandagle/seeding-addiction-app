import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeStore } from '../stores/themeStore';
import type { Relapse } from '../db/schema';

interface HistoryCalendarProps {
  relapses: Relapse[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  journeyStart: string | null;
}

export default function HistoryCalendar({
  relapses,
  selectedDate,
  onDateSelect,
  journeyStart,
}: HistoryCalendarProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const isDark = colorScheme === 'dark';

  // Create marked dates object for the calendar
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    // Mark relapse dates
    relapses.forEach((relapse) => {
      const dateKey = new Date(relapse.timestamp).toISOString().split('T')[0];
      marks[dateKey] = {
        marked: true,
        dotColor: '#EF4444', // red-500
        customStyles: {
          container: {
            backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', // red-900/red-100
            borderRadius: 8,
          },
          text: {
            color: isDark ? '#FFFFFF' : '#991B1B', // white/red-800
            fontWeight: 'bold',
          },
        },
      };
    });

    // Mark selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: isDark ? '#047857' : '#10B981', // emerald-700/emerald-500
        customStyles: {
          ...marks[selectedDate]?.customStyles,
          container: {
            ...marks[selectedDate]?.customStyles?.container,
            borderWidth: 2,
            borderColor: '#10B981', // emerald-500
          },
        },
      };
    }

    // Mark today
    const today = new Date().toISOString().split('T')[0];
    if (!marks[today]) {
      marks[today] = {
        marked: true,
        dotColor: isDark ? '#60A5FA' : '#3B82F6', // blue-400/blue-500
      };
    }

    return marks;
  }, [relapses, selectedDate, isDark]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      onDateSelect(day.dateString);
    },
    [onDateSelect]
  );

  const theme = useMemo(
    () => ({
      calendarBackground: isDark ? '#1F2937' : '#FFFFFF', // gray-800/white
      textSectionTitleColor: isDark ? '#9CA3AF' : '#6B7280', // gray-400/gray-500
      selectedDayBackgroundColor: '#10B981', // emerald-500
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#10B981', // emerald-500
      dayTextColor: isDark ? '#F9FAFB' : '#111827', // gray-50/gray-900
      textDisabledColor: isDark ? '#4B5563' : '#D1D5DB', // gray-600/gray-300
      monthTextColor: isDark ? '#F9FAFB' : '#111827', // gray-50/gray-900
      textMonthFontWeight: 'bold' as const,
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 12,
      arrowColor: '#10B981', // emerald-500
    }),
    [isDark]
  );

  return (
    <View className="px-6 py-4">
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={theme}
        enableSwipeMonths={true}
        // Allow future dates - no restrictions
        maxDate={undefined}
        // Show calendar from journey start or first relapse
        minDate={journeyStart || undefined}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      />
    </View>
  );
}
