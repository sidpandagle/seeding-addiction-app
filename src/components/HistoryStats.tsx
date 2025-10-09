import { View, Text } from 'react-native';

interface HistoryStatsProps {
  streak: number;
  total: number;
}

export default function HistoryStats({ streak, total }: HistoryStatsProps) {
  return (
    <View className="flex-row gap-3 mt-2 mb-1">
      {/* Current Streak Card */}
      <View className="flex-1 p-4 border bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border-emerald-200 dark:border-emerald-800">
        <Text className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          Current Streak
        </Text>
        <Text className="mb-1 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
          {streak}
        </Text>
        <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
          {streak === 1 ? 'day' : 'days'} clean
        </Text>
      </View>

      {/* Total Relapses Card */}
      <View className="flex-1 p-4 border border-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-2xl dark:border-gray-700">
        <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          Total Events
        </Text>
        <Text className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
          {total}
        </Text>
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {total === 1 ? 'relapse' : 'relapses'}
        </Text>
      </View>
    </View>
  );
}
