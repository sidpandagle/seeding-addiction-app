import { View, Text } from 'react-native';
import type { HistoryEntry } from '../../types/history';

interface CalendarRelapseDetailsProps {
  selectedDate: string | null;
  entries: HistoryEntry[];
}

export default function CalendarRelapseDetails({ selectedDate, entries }: CalendarRelapseDetailsProps) {
  if (!selectedDate) {
    return (
      <View className="px-6 py-8 mx-6 mt-2">
        <View className="items-center p-8 bg-white dark:bg-gray-900 rounded-3xl">
          <View className="items-center justify-center w-16 h-16 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <Text className="text-3xl">📅</Text>
          </View>
          <Text className="text-base font-semibold text-center text-gray-600 dark:text-gray-400">
            Select a date to view details
          </Text>
        </View>
      </View>
    );
  }

  // Filter entries for the selected date
  const dayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.data.timestamp).toISOString().split('T')[0];
    return entryDate === selectedDate;
  });

  // Separate relapses and urges
  const dayRelapses = dayEntries.filter(e => e.type === 'relapse');
  const dayUrges = dayEntries.filter(e => e.type === 'urge');

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (dayEntries.length === 0) {
    return (
      <View className="px-6 py-6 mx-6 mt-2 mb-6 bg-white dark:bg-gray-900 rounded-3xl">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <Text className="text-2xl">✨</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
            <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
              No events on this day
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Determine the icon and color based on entry types
  let headerIcon = '📍';
  let headerBgColor = 'bg-blue-50 dark:bg-blue-900/30';
  let headerTextColor = 'text-blue-600 dark:text-blue-400';

  if (dayRelapses.length > 0 && dayUrges.length > 0) {
    // Mixed
    headerIcon = '📊';
    headerBgColor = 'bg-amber-50 dark:bg-amber-900/30';
    headerTextColor = 'text-amber-600 dark:text-amber-400';
  } else if (dayRelapses.length > 0) {
    // Only relapses
    headerIcon = '📍';
    headerBgColor = 'bg-red-50 dark:bg-red-900/30';
    headerTextColor = 'text-red-600 dark:text-red-400';
  } else {
    // Only urges
    headerIcon = '🎯';
    headerBgColor = 'bg-green-50 dark:bg-green-900/30';
    headerTextColor = 'text-green-600 dark:text-green-400';
  }

  return (
    <View className="px-6 py-6 mx-6 mt-2 mb-6 bg-white border border-white dark:bg-gray-900 rounded-3xl dark:border-gray-900">
      <View className="flex-row items-center gap-3 mb-5">
        <View className={`items-center justify-center w-12 h-12 rounded-2xl ${headerBgColor}`}>
          <Text className="text-2xl">{headerIcon}</Text>
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
          <Text className={`text-sm font-bold ${headerTextColor}`}>
            {dayEntries.length} {dayEntries.length === 1 ? 'event' : 'events'} recorded
            {dayRelapses.length > 0 && dayUrges.length > 0 && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {' '}({dayRelapses.length} relapse, {dayUrges.length} urge)
              </Text>
            )}
          </Text>
        </View>
      </View>

      {/* Render relapses first */}
      {dayRelapses.length > 0 && (
        <View className="mb-4">
          <Text className="mb-3 text-xs font-bold tracking-wide text-red-600 uppercase dark:text-red-400">
            Relapses ({dayRelapses.length})
          </Text>
          {dayRelapses.map((entry, index) => {
            const relapse = entry.data;
            return (
              <View
                key={relapse.id}
                className={`p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/40 ${index < dayRelapses.length - 1 ? 'mb-3' : ''}`}
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-base">🕐</Text>
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(relapse.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {relapse.note && (
                  <Text className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{relapse.note}</Text>
                )}

                {relapse.tags && relapse.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {relapse.tags.map((tag: string) => (
                      <View key={tag} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-xl">
                        <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Render urges */}
      {dayUrges.length > 0 && (
        <View>
          <Text className="mb-3 text-xs font-bold tracking-wide text-green-600 uppercase dark:text-green-400">
            Urges Resisted ({dayUrges.length})
          </Text>
          {dayUrges.map((entry, index) => {
            const urge = entry.data;
            return (
              <View
                key={urge.id}
                className={`p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/40 ${index < dayUrges.length - 1 ? 'mb-3' : ''}`}
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-base">🕐</Text>
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(urge.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {urge.note && (
                  <Text className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{urge.note}</Text>
                )}

                {urge.context && (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    <View className="px-4 py-2 bg-white dark:bg-gray-700 rounded-xl">
                      <Text className="text-xs font-bold text-green-700 dark:text-green-300">
                        Context: {urge.context}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
