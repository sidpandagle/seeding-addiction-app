import React from 'react';
import { View, Text, Pressable } from 'react-native';
import AchievementBadge, { Achievement } from './AchievementBadge';

interface AchievementsGridProps {
  achievements: Achievement[];
  title?: string;
  columns?: number;
  onAchievementPress?: (achievement: Achievement) => void;
}

export default function AchievementsGrid({
  achievements,
  title = 'Achievements',
  columns = 3,
  onAchievementPress,
}: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  // Group achievements into rows
  const rows: Achievement[][] = [];
  for (let i = 0; i < achievements.length; i += columns) {
    rows.push(achievements.slice(i, i + columns));
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {unlockedCount} of {totalCount} unlocked
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="items-center">
          <View
            className={`items-center justify-center w-16 h-16 rounded-full border-3 ${
              unlockedCount === totalCount
                ? 'bg-gray-100 dark:bg-gray-800 border-yellow-500'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                unlockedCount === totalCount
                  ? 'text-yellow-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {Math.round((unlockedCount / totalCount) * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Achievements Grid - Row by Row */}
      <View className="gap-4">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-start gap-4">
            {row.map((achievement) => (
              <Pressable
                key={achievement.id}
                onPress={() => onAchievementPress?.(achievement)}
                className="flex-1"
                style={{ maxWidth: `${100 / columns}%` }}
              >
                <AchievementBadge
                  achievement={achievement}
                  size="medium"
                  animated={false}
                />
              </Pressable>
            ))}
            {/* Add empty spacers for incomplete rows */}
            {row.length < columns &&
              Array.from({ length: columns - row.length }).map((_, index) => (
                <View key={`spacer-${index}`} className="flex-1" style={{ maxWidth: `${100 / columns}%` }} />
              ))
            }
          </View>
        ))}
      </View>
    </View>
  );
}
