import { View, Text, Pressable } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Badge } from '../../db/schema';
import { useColorScheme } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';

interface BadgeCardProps {
  badge: Badge;
  isLocked: boolean;
  progress?: number; // 0-1 for badges close to unlock
  current?: number; // Current progress value
  required?: number; // Required value to unlock
  onPress?: () => void;
  staggerIndex?: number;
}

function BadgeCard({ badge, isLocked, progress, current, required, onPress, staggerIndex = 0 }: Readonly<BadgeCardProps>) {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <View>
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
                : 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-100 dark:border-amber-700'
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
        </View>

        {/* Badge Title */}
        <Text
          className={`text-sm font-bold text-center mb-1 line-clamp-1 ${
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

        {/* Percentage Display for Locked Badges with Progress */}
        {isLocked && progress !== undefined && progress > 0 && (
          <View className="w-full mt-2" style={{ width: 110 }}>
            <Text className="text-[10px] font-semibold text-center text-amber-600 dark:text-amber-400">
              {Math.round(progress * 100)}% complete
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default memo(BadgeCard);
