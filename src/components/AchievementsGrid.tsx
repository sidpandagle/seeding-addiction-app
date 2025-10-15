import React from 'react';
import { View, Pressable } from 'react-native';
import AchievementBadge, { Achievement } from './AchievementBadge';

interface AchievementsGridProps {
  achievements: Achievement[];
  columns?: number;
  onAchievementPress?: (achievement: Achievement) => void;
}

// Phase 2 Optimization: Memoize component to prevent re-renders on parent updates
const AchievementsGrid = React.memo(function AchievementsGrid({
  achievements,
  columns = 3,
  onAchievementPress,
}: AchievementsGridProps) {
  // Group achievements into rows
  const rows: Achievement[][] = [];
  for (let i = 0; i < achievements.length; i += columns) {
    rows.push(achievements.slice(i, i + columns));
  }

  return (
    <View>
      {/* Achievements Grid - Row by Row */}
      <View className="gap-y-8">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-between">
            {row.map((achievement) => (
              <Pressable
                key={achievement.id}
                onPress={() => onAchievementPress?.(achievement)}
                style={{ width: `${100 / columns - 2}%` }}
              >
                <AchievementBadge
                  achievement={achievement}
                  size="large"
                  animated={false}
                />
              </Pressable>
            ))}
            {/* Add empty spacers for incomplete rows to maintain alignment */}
            {row.length < columns &&
              Array.from({ length: columns - row.length }).map((_, index) => (
                <View key={`spacer-${index}`} style={{ width: `${100 / columns - 2}%` }} />
              ))
            }
          </View>
        ))}
      </View>
    </View>
  );
});

export default AchievementsGrid;
