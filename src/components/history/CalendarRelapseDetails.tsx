import { View, Text } from 'react-native';
import type { Relapse } from '../../db/schema';

interface CalendarRelapseDetailsProps {
  selectedDate: string | null;
  relapses: Relapse[];
}

export default function CalendarRelapseDetails({ selectedDate, relapses }: CalendarRelapseDetailsProps) {
  if (!selectedDate) {
    return (
      <View className="px-6 py-8 mx-6 mt-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
        <Text className="text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          Select a date to view details
        </Text>
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
      <View className="px-6 py-6 mx-6 mt-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
        <Text className="mb-3 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
        <View className="flex-row items-center gap-2 mt-3">
          <View className="w-3 h-3 rounded-full bg-emerald-500" />
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">No relapses on this day</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 py-6 mx-6 mt-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <Text className="mb-3 text-base font-bold text-gray-900 dark:text-white">{formattedDate}</Text>

      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-3 h-3 bg-red-500 rounded-full" />
        <Text className="text-sm font-bold text-red-600 dark:text-red-400">
          {dayRelapses.length} {dayRelapses.length === 1 ? 'relapse' : 'relapses'} recorded
        </Text>
      </View>

      {dayRelapses.map((relapse, index) => (
        <View
          key={relapse.id}
          className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-xl ${index < dayRelapses.length - 1 ? 'mb-3' : ''}`}
        >
          <Text className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
            {new Date(relapse.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>

          {relapse.note && (
            <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-300">{relapse.note}</Text>
          )}

          {relapse.tags && relapse.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {relapse.tags.map((tag: string) => (
                <View key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-full dark:bg-gray-700 dark:border-gray-600">
                  <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
