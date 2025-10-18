import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, ZoomInRotate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import type { Achievement } from '../../utils/growthStages';

// Re-export Achievement type from growthStages for backward compatibility
export type { Achievement } from '../../utils/growthStages';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  onPress?: () => void;
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  animated = true,
  onPress,
}: AchievementBadgeProps) {
  const theme = useThemeStore((state: any) => state.theme);
  const isDark = theme === 'dark';

  // Size configurations
  const sizeConfig = {
    small: { container: 60, emoji: 24, badge: 50 },
    medium: { container: 80, emoji: 32, badge: 70 },
    large: { container: 100, emoji: 36, badge: 80 },
  };

  const config = sizeConfig[size];

  // Color configurations based on unlock status
  const colors = achievement.isUnlocked
    ? {
      gradient: ['#FFD700', '#FFA500'], // Golden gradient for unlocked
      background: isDark ? '#2C2C2E' : '#FFFFFF',
      border: '#FFD700',
      text: isDark ? '#FFFFFF' : '#212121',
      opacity: 1,
    }
    : {
      gradient: ['#757575', '#9E9E9E'], // Gray for locked
      background: isDark ? '#2C2C2E' : '#F5F5F5',
      border: isDark ? '#38383A' : '#E0E0E0',
      text: isDark ? '#ABABAB' : '#BDBDBD',
      opacity: 0.5,
    };

  const BadgeContent = (
    <View className="items-center justify-center" style={{ width: '100%' }}>
      {/* Badge Circle */}
      <View
        className={`items-center justify-center rounded-full border-3 ${
          achievement.isUnlocked
            ? 'bg-white dark:bg-gray-800 border-yellow-500'
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
        }`}
        style={{ width: config.badge, height: config.badge }}
      >
        {achievement.isUnlocked ? (
          // Unlocked: Show gradient glow effect
          <>
            <View className="absolute" style={{ width: config.badge, height: config.badge }}>
              <LinearGradient
                colors={[colors.gradient[0], colors.gradient[1], 'transparent']}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: config.badge / 2,
                  opacity: 0.3,
                }}
              />
            </View>
            <Text style={{ fontSize: config.emoji, opacity: colors.opacity }}>
              {achievement.emoji}
            </Text>
          </>
        ) : (
          // Locked: Show grayscale emoji with lock overlay
          <View className="items-center justify-center">
            <Text style={{ fontSize: config.emoji, opacity: colors.opacity }}>
              {achievement.emoji}
            </Text>
            <View className="absolute top-0 right-0">
              <Text style={{ fontSize: config.emoji / 2 }}>🔒</Text>
            </View>
          </View>
        )}
      </View>

      {/* Badge Title (optional for small size) */}
      {size !== 'small' && (
        <Text
          className={`mt-2 text-xs font-medium text-center ${
            achievement.isUnlocked
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }`}
          numberOfLines={2}
          style={{ width: '100%' }}
        >
          {achievement.title}
        </Text>
      )}
    </View>
  );

  if (animated && achievement.isUnlocked) {
    return (
      <Animated.View entering={ZoomInRotate.springify().damping(12).stiffness(100).mass(0.8)}>
        {BadgeContent}
      </Animated.View>
    );
  }

  return BadgeContent;
}
