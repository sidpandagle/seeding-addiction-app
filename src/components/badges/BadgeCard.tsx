import { View, Text, Pressable } from 'react-native';
import { Lock, Sparkles } from 'lucide-react-native';
import { Badge } from '../../db/schema';
import { useColorScheme } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { memo } from 'react';

interface BadgeCardProps {
  badge: Badge;
  isLocked: boolean;
  progress?: number; // 0-1 for badges close to unlock
  onPress?: () => void;
  staggerIndex?: number;
}

function BadgeCard({ badge, isLocked, progress, onPress, staggerIndex = 0 }: Readonly<BadgeCardProps>) {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(staggerIndex * 50).springify()}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        className="items-center"
      >
        {/* Circular Badge Container */}
        <View className={`relative mb-3 ${isLocked ? 'opacity-60' : ''}`}>
          {/* Main Badge Circle */}
          <View
            className={`items-center justify-center rounded-full ${
              isLocked
                ? 'bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-700'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-2 border-amber-200 dark:border-amber-700/50'
            }`}
            style={{ width: 100, height: 100 }}
          >
            {/* Emoji */}
            <Text className={`text-4xl ${isLocked ? 'opacity-50' : ''}`}>
              {badge.emoji}
            </Text>
          </View>

          {/* Lock Icon for Locked Badges */}
          {isLocked && (
            <View className="absolute items-center justify-center w-8 h-8 bg-gray-600 border-2 border-white rounded-full -bottom-1 -right-1 dark:bg-gray-500 dark:border-gray-900">
              <Lock size={14} color="#fff" strokeWidth={2.5} />
            </View>
          )}

          {/* Sparkle Indicator for Unlocked Badges */}
          {!isLocked && (
            <View className="absolute items-center justify-center rounded-full -top-1 -right-1 w-7 h-7 bg-amber-500 dark:bg-amber-600">
              <Sparkles size={14} color="#fff" strokeWidth={2.5} />
            </View>
          )}
        </View>

        {/* Badge Title */}
        <Text
          className={`text-sm font-bold text-center mb-1 ${
            isLocked
              ? 'text-gray-500 dark:text-gray-500'
              : 'text-gray-900 dark:text-white'
          }`}
          numberOfLines={2}
          style={{ width: 110 }}
        >
          {badge.title}
        </Text>

        {/* Badge Description */}
        <Text
          className={`text-xs font-medium text-center ${
            isLocked
              ? 'text-gray-400 dark:text-gray-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          numberOfLines={2}
          style={{ width: 110 }}
        >
          {badge.description}
        </Text>

        {/* Progress Bar for Locked Badges */}
        {isLocked && progress !== undefined && progress > 0 && (
          <View className="w-full mt-2" style={{ width: 110 }}>
            <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full bg-amber-400 dark:bg-amber-500"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
            <Text className="mt-1 text-[10px] font-semibold text-center text-amber-600 dark:text-amber-400">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default memo(BadgeCard);
