import { View, Text } from 'react-native';
import { Badge } from '../../db/schema';

interface BadgeProgressProps {
  badge: Badge;
  current: number;
  required: number;
  compact?: boolean;
}

export default function BadgeProgress({
  badge,
  current,
  required,
  compact = false,
}: BadgeProgressProps) {
  const progress = Math.min(current / required, 1);
  const percentage = Math.round(progress * 100);

  if (compact) {
    return (
      <View className="flex-row items-center space-x-2">
        <Text className="text-2xl">{badge.emoji}</Text>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {badge.title}
          </Text>
          <View className="flex-row items-center mt-1 space-x-2">
            <View className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
              <View
                className="h-full bg-blue-500 rounded-full dark:bg-blue-600"
                style={{ width: `${percentage}%` }}
              />
            </View>
            <Text className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {current}/{required}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
      <View className="flex-row items-center mb-3">
        <Text className="mr-3 text-4xl">{badge.emoji}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{badge.title}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View className="h-3 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-800">
          <View
            className="h-full bg-blue-500 rounded-full dark:bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>

      {/* Progress Text */}
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {current} / {required}
        </Text>
        <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {percentage}% Complete
        </Text>
      </View>

      {/* Almost there message */}
      {percentage >= 80 && percentage < 100 && (
        <View className="p-2 mt-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
          <Text className="text-xs font-semibold text-center text-amber-700 dark:text-amber-400">
            Almost there! Keep going!
          </Text>
        </View>
      )}
    </View>
  );
}
