import { View, Text, Pressable } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Badge } from '../../db/schema';
import { useThemeColors } from '../../hooks/useThemeColors';
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
  const colors = useThemeColors();

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
                ? 'bg-subtle border-2 border-border'
                : 'bg-gold-soft border-2 border-gold/30'
            }`}
            style={{ width: 100, height: 100 }}
          >
            {/* Emoji */}
            <Text className={`font-regular text-4xl ${isLocked ? 'opacity-50' : ''}`}>
              {badge.emoji}
            </Text>
          </View>

          {/* Lock Icon for Locked Badges */}
          {isLocked && (
            <View className="absolute items-center justify-center w-8 h-8 border-2 rounded-full bg-muted border-surface -bottom-1 -right-1">
              <Lock size={14} color={colors.surface} strokeWidth={2.5} />
            </View>
          )}
        </View>

        {/* Badge Title */}
        <Text
          className={`text-sm font-bold text-center mb-1 line-clamp-1 ${
            isLocked
              ? 'text-muted'
              : 'text-fg'
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
              ? 'text-faint'
              : 'text-muted'
          }`}
          numberOfLines={2}
          style={{ width: 110 }}
        >
          {badge.description}
        </Text>

        {/* Percentage Display for Locked Badges with Progress */}
        {isLocked && progress !== undefined && progress > 0 && (
          <View className="w-full mt-2" style={{ width: 110 }}>
            <Text className="text-xs font-semibold text-center text-gold-ink">
              {Math.round(progress * 100)}% complete
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default memo(BadgeCard);
