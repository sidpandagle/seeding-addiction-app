import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import AchievementBadge, { Achievement } from './AchievementBadge';
import { useThemeStore } from '../stores/themeStore';

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
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 mb-4">
        <View>
          <Text
            className="text-lg font-semibold"
            style={{ color: isDark ? '#FFFFFF' : '#212121' }}
          >
            {title}
          </Text>
          <Text
            className="mt-1 text-sm"
            style={{ color: isDark ? '#ABABAB' : '#757575' }}
          >
            {unlockedCount} of {totalCount} unlocked
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="items-center">
          <View
            className="w-16 h-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
              borderWidth: 3,
              borderColor: unlockedCount === totalCount ? '#FFD700' : isDark ? '#38383A' : '#E0E0E0',
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: unlockedCount === totalCount ? '#FFD700' : isDark ? '#FFFFFF' : '#212121' }}
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
        contentContainerStyle={{ paddingHorizontal: 24 }}
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
