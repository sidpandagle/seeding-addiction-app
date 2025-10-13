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
        // Use standard marking without custom container styles to preserve touch handling
        customStyles: {
          text: {
            color: isDark ? '#FECACA' : '#991B1B', // red-200/red-800
            fontWeight: 'bold',
            fontSize: 18,
          },
        },
      };
    });

    // Mark selected date
    if (selectedDate) {
      const isRelapseDate = marks[selectedDate];
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: isDark ? '#047857' : '#10B981', // emerald-700/emerald-500
        selectedTextColor: '#FFFFFF',
        marked: isRelapseDate?.marked,
        dotColor: isRelapseDate?.dotColor,
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
      textDayFontSize: 18, // Increased from 14
      textMonthFontSize: 20, // Increased from 16
      textDayHeaderFontSize: 14, // Increased from 12
      arrowColor: '#10B981', // emerald-500
    }),
    [isDark]
  );

  return (
    <View className="px-6 py-6">
      <View className="overflow-hidden border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
        <Calendar
          key={colorScheme} // Force re-render when theme changes
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
            paddingVertical: 12,
            paddingHorizontal: 8,
          }}
        />
      </View>
    </View>
  );
}
