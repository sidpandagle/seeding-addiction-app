import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useColorScheme } from '../../stores/themeStore';
import type { HistoryEntry } from '../../types/history';

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
  const isDark = colorScheme === 'dark';

  // Create marked dates object for the calendar
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    // Group entries by date to handle mixed dates (both relapse and activity on same day)
    const dateGroups: { [key: string]: { hasRelapse: boolean; hasActivity: boolean } } = {};

    entries.forEach((entry) => {
      const dateKey = new Date(entry.data.timestamp).toISOString().split('T')[0];
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { hasRelapse: false, hasActivity: false };
      }
      if (entry.type === 'relapse') {
        dateGroups[dateKey].hasRelapse = true;
      } else {
        dateGroups[dateKey].hasActivity = true;
      }
    });

    // Mark dates based on entry types
    Object.entries(dateGroups).forEach(([dateKey, { hasRelapse, hasActivity }]) => {
      let dotColor: string;
      let textColor: string;

      if (hasRelapse && hasActivity) {
        // Both types on same day - use amber/yellow
        dotColor = '#F59E0B'; // amber-500
        textColor = isDark ? '#FDE68A' : '#92400E'; // amber-200/amber-800
      } else if (hasRelapse) {
        // Only relapse - red
        dotColor = '#EF4444'; // red-500
        textColor = isDark ? '#FECACA' : '#991B1B'; // red-200/red-800
      } else {
        // Only activity - green
        dotColor = '#10B981'; // green-500
        textColor = isDark ? '#A7F3D0' : '#065F46'; // green-200/green-800
      }

      marks[dateKey] = {
        marked: true,
        dotColor,
        customStyles: {
          text: {
            color: textColor,
            fontWeight: 'bold',
            fontSize: 18,
          },
        },
      };
    });

    // Mark selected date
    if (selectedDate) {
      const markedDate = marks[selectedDate];
      let selectedColor: string;
      let selectedTextColor: string;

      if (markedDate?.marked) {
        // Use color matching the dot color
        if (markedDate.dotColor === '#EF4444') {
          // Red for relapse
          selectedColor = isDark ? '#7f1d1d' : '#fca5a5'; // red-900/red-300
          selectedTextColor = isDark ? '#fecaca' : '#7f1d1d'; // red-200/red-900
        } else if (markedDate.dotColor === '#10B981') {
          // Green for activity
          selectedColor = isDark ? '#065F46' : '#86EFAC'; // green-900/green-300
          selectedTextColor = isDark ? '#A7F3D0' : '#065F46'; // green-200/green-900
        } else {
          // Amber for mixed
          selectedColor = isDark ? '#78350F' : '#FCD34D'; // amber-900/amber-300
          selectedTextColor = isDark ? '#FDE68A' : '#78350F'; // amber-200/amber-900
        }
      } else {
        // Default blue for non-marked dates
        selectedColor = isDark ? '#1d4ed8' : '#3B82F6'; // blue-700/blue-500
        selectedTextColor = '#FFFFFF';
      }

      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor,
        selectedTextColor,
        marked: markedDate?.marked,
        dotColor: markedDate?.dotColor,
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
  }, [entries, selectedDate, isDark]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      onDateSelect(day.dateString);
    },
    [onDateSelect]
  );

  const theme = useMemo(
    () => ({
      calendarBackground: isDark ? '#111827' : '#FFFFFF', // gray-800/white
      textSectionTitleColor: isDark ? '#9CA3AF' : '#6B7280', // gray-400/gray-500
      selectedDayBackgroundColor: '#3B82F6', // blue-500
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#3B82F6', // blue-500
      dayTextColor: isDark ? '#F9FAFB' : '#111827', // gray-50/gray-900
      textDisabledColor: isDark ? '#4B5563' : '#D1D5DB', // gray-600/gray-300
      monthTextColor: isDark ? '#F9FAFB' : '#111827', // gray-50/gray-900
      textMonthFontWeight: 'bold' as const,
      textDayFontSize: 18, // Increased from 14
      textMonthFontSize: 20, // Increased from 16
      textDayHeaderFontSize: 14, // Increased from 12
      arrowColor: '#3B82F6', // blue-500
    }),
    [isDark]
  );

  return (
    <View className="px-6 py-4">
      <View className="overflow-hidden bg-white dark:bg-gray-900 rounded-3xl">
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
            paddingVertical: 16,
            paddingHorizontal: 12,
          }}
        />
      </View>
    </View>
  );
});

export default HistoryCalendar;
