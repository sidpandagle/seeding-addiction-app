import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import AchievementBadge, { Achievement } from './AchievementBadge';

interface AchievementsGridProps {
  achievements: Achievement[];
  title?: string;
  columns?: number;
}

export default function AchievementsGrid({
  achievements,
  title = 'Achievements',
  columns = 4,
}: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 mb-4">
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

      {/* Achievements Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-6"
        className="mb-2"
      >
        <View className="flex-row flex-wrap gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="medium"
              animated={false}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
