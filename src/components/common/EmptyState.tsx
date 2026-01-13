import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from '../../stores/themeStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  tips?: string[];
  actionLabel?: string;
  onActionPress?: () => void;
  delay?: number;
}

/**
 * Reusable empty state component for when users have no data
 * Shows helpful guidance and encouragement to get started
 */
export default function EmptyState({
  icon: Icon,
  iconColor = '#10b981',
  iconBgColor,
  title,
  description,
  tips = [],
  actionLabel,
  onActionPress,
  delay = 0,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const reducedMotion = useReducedMotion();

  const bgColor = iconBgColor || (colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5');

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(400).delay(delay)}
      className="px-6 mb-6"
    >
      <View
        style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
        className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl"
      >
        {/* Icon */}
        <View className="items-center mb-4">
          <View
            style={{ backgroundColor: bgColor }}
            className="items-center justify-center w-16 h-16 rounded-full"
          >
            <Icon size={32} color={iconColor} strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
          {title}
        </Text>

        {/* Description */}
        <Text className="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {description}
        </Text>

        {/* Tips */}
        {tips.length > 0 && (
          <View className="p-4 mb-4 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl">
            {tips.map((tip, index) => (
              <View key={index} className="flex-row mb-2 last:mb-0">
                <Text className="mr-2 text-sm text-emerald-600 dark:text-emerald-400">•</Text>
                <Text className="flex-1 text-sm leading-5 text-emerald-700 dark:text-emerald-300">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        {actionLabel && onActionPress && (
          <Pressable
            onPress={onActionPress}
            className="py-4 rounded-xl bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800"
          >
            <Text className="text-base font-bold text-center text-white">
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
