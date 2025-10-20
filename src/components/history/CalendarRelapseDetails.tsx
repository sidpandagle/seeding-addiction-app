import { View, Text } from 'react-native';
import type { Relapse } from '../../db/schema';

interface CalendarRelapseDetailsProps {
  selectedDate: string | null;
  relapses: Relapse[];
}

export default function CalendarRelapseDetails({ selectedDate, relapses }: CalendarRelapseDetailsProps) {
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

  // Filter relapses for the selected date
  const dayRelapses = relapses.filter((relapse) => {
    const relapseDate = new Date(relapse.timestamp).toISOString().split('T')[0];
    return relapseDate === selectedDate;
  });

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (dayRelapses.length === 0) {
    return (
      <View className="px-6 py-6 mx-6 mt-2 mb-6 bg-white dark:bg-gray-900 rounded-3xl">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <Text className="text-2xl">✨</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
            <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
              No relapses on this day
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 py-6 mx-6 mt-2 mb-6 bg-white border border-white dark:bg-gray-900 rounded-3xl dark:border-gray-900">
      <View className="flex-row items-center gap-3 mb-5">
        <View className="items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl">
          <Text className="text-2xl">📍</Text>
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
          <Text className="text-sm font-bold text-red-600 dark:text-red-400">
            {dayRelapses.length} {dayRelapses.length === 1 ? 'event' : 'events'} recorded
          </Text>
        </View>
      </View>

      {dayRelapses.map((relapse, index) => (
        <View
          key={relapse.id}
          className={`p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl ${index < dayRelapses.length - 1 ? 'mb-3' : ''}`}
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
      ))}
    </View>
  );
}
