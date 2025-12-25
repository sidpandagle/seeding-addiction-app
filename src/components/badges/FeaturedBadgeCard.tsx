import { View, Text, Pressable } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Badge, EarnedBadge } from '../../db/schema';
import { useColorScheme } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface FeaturedBadgeCardProps {
  badge: Badge;
  earnedBadge: EarnedBadge;
  onPress?: () => void;
  index: number;
}

export default function FeaturedBadgeCard({ badge, earnedBadge, onPress, index }: FeaturedBadgeCardProps) {
  const colorScheme = useColorScheme();

  const formatUnlockDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Unlocked today';
    if (diffDays === 1) return 'Unlocked yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      className="mr-4"
      style={{ width: 300 }}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        className="overflow-hidden rounded-3xl"
      >
        <View className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200/80 dark:border-amber-700/40 p-5">
          <View className="flex-row items-center">
            {/* Left: Circular Badge */}
            <View className="relative mr-4">
              <View className="items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-2 border-amber-300 dark:border-amber-600/50">
                <Text className="text-4xl">{badge.emoji}</Text>
              </View>
              {/* Sparkle Badge */}
              <View className="absolute -top-1 -right-1 items-center justify-center w-6 h-6 bg-amber-500 dark:bg-amber-600 rounded-full">
                <Sparkles size={12} color="#fff" strokeWidth={2.5} />
              </View>
            </View>

            {/* Right: Badge Info */}
            <View className="flex-1">
              {/* Unlocked Label */}
              <View className="flex-row items-center mb-1.5">
                <View className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full mr-1.5" />
                <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Unlocked
                </Text>
              </View>

              {/* Title */}
              <Text
                className="text-base font-bold text-gray-900 dark:text-white mb-1"
                numberOfLines={1}
              >
                {badge.title}
              </Text>

              {/* Description */}
              <Text
                className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2"
                numberOfLines={2}
              >
                {badge.description}
              </Text>

              {/* Date */}
              <Text className="text-[11px] font-semibold text-gray-500 dark:text-gray-500">
                {formatUnlockDate(earnedBadge.unlocked_at)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
