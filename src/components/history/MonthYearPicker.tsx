import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface YearMonth {
  year: number;
  /** 0-11 */
  month: number;
}

interface MonthYearPickerProps {
  visible: boolean;
  /** Month the calendar is showing now */
  value: YearMonth;
  /** Earliest and latest months that can be picked */
  min: YearMonth;
  max: YearMonth;
  onSelect: (target: YearMonth) => void;
  onToday: () => void;
  onClose: () => void;
}

const toIndex = ({ year, month }: YearMonth) => year * 12 + month;

/**
 * Jump straight to any month: pick a year with the arrows, then tap a month.
 * Months outside min..max are dimmed and can't be tapped.
 */
const MonthYearPicker = React.memo(function MonthYearPicker({
  visible,
  value,
  min,
  max,
  onSelect,
  onToday,
  onClose,
}: MonthYearPickerProps) {
  const colors = useThemeColors();
  const [year, setYear] = useState(value.year);

  // Start on the year being viewed each time the picker opens
  useEffect(() => {
    if (visible) setYear(value.year);
  }, [visible, value.year]);

  const canGoBack = year > min.year;
  const canGoForward = year < max.year;
  const arrowColor = (enabled: boolean) => (enabled ? colors.primary : colors.faint);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        className="items-center justify-center flex-1 px-8 bg-black/50"
        onPress={onClose}
        accessibilityLabel="Close month picker"
      >
        {/* Inner Pressable swallows taps so only the backdrop closes the picker */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm p-5 bg-surface border border-border rounded-3xl"
        >
          {/* Year switcher */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => setYear((y) => y - 1)}
              disabled={!canGoBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Previous year"
              className="items-center justify-center w-10 h-10 rounded-full active:opacity-60"
            >
              <ChevronLeft size={24} color={arrowColor(canGoBack)} strokeWidth={2.5} />
            </Pressable>
            <Text className="text-xl font-bold text-fg" accessibilityRole="header">
              {year}
            </Text>
            <Pressable
              onPress={() => setYear((y) => y + 1)}
              disabled={!canGoForward}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Next year"
              className="items-center justify-center w-10 h-10 rounded-full active:opacity-60"
            >
              <ChevronRight size={24} color={arrowColor(canGoForward)} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Month grid */}
          <View className="flex-row flex-wrap">
            {MONTHS.map((label, month) => {
              const index = toIndex({ year, month });
              const disabled = index < toIndex(min) || index > toIndex(max);
              const selected = year === value.year && month === value.month;
              return (
                <View key={label} className="w-1/3 p-1">
                  <Pressable
                    disabled={disabled}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onSelect({ year, month });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={`${label} ${year}`}
                    className={`items-center justify-center h-12 rounded-xl active:opacity-70 ${
                      selected ? 'bg-primary' : 'bg-subtle'
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        selected
                          ? 'text-primary-on'
                          : disabled
                            ? 'text-faint'
                            : 'text-fg'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Shortcuts */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onToday();
              }}
              accessibilityRole="button"
              accessibilityLabel="Jump to the current month"
              className="items-center flex-1 py-3 rounded-xl bg-primary-soft active:opacity-70"
            >
              <Text className="text-sm font-bold text-primary-ink">This month</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="items-center flex-1 py-3 bg-subtle rounded-xl active:opacity-70"
            >
              <Text className="text-sm font-bold text-body">Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

export default MonthYearPicker;
