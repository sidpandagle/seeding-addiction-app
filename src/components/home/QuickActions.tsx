import React, { memo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useReducedMotion, ANIMATION_PRESETS, getStaggerDelay } from '../../hooks/useReducedMotion';
import { QUICK_ACTIONS, getActionColorClasses, getRandomBulletPoints, BULLET_POOLS, getQuickActionCategory, type QuickAction } from '../../data/quickActionData';

interface QuickActionsProps {
  onActionPress?: (categories: string[]) => void;
}

/**
 * Get fresh random bullet points for all actions
 */
function getRandomizedActions(): QuickAction[] {
  return QUICK_ACTIONS.map(action => ({
    ...action,
    bulletPoints: getRandomBulletPoints(BULLET_POOLS[action.id as keyof typeof BULLET_POOLS] || action.bulletPoints),
  }));
}

/**
 * Quick action cards to help users resist urges
 * Condensed version of emergency help actions for proactive home screen display
 */
const QuickActionsComponent: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  const colorScheme = useColorScheme();
  const reducedMotion = useReducedMotion();
  const [actions, setActions] = useState<QuickAction[]>(getRandomizedActions);

  // Refresh bullet points on mount (each time user visits home page)
  useEffect(() => {
    setActions(getRandomizedActions());
  }, []);

  const handleActionPress = (actionId: string) => {
    if (onActionPress) {
      const category = getQuickActionCategory(actionId);
      onActionPress(category ? [category] : []);
    }
  };

  return (
    <View className="px-6 mb-6">
      {/* Header with entrance animation */}
      <Animated.View
        entering={reducedMotion ? undefined : FadeInDown.duration(ANIMATION_PRESETS.card.duration)}
        className="flex-row items-center justify-between mb-6"
      >
        <View className="flex-row items-center gap-2">
          <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Healthy Distractions
          </Text>
        </View>
      </Animated.View>

      {/* Action Cards - Horizontal Scroll with staggered animations */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-6"
      >
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            entering={reducedMotion ? undefined : FadeInRight.duration(ANIMATION_PRESETS.card.duration).delay(getStaggerDelay(index, ANIMATION_PRESETS.card.staggerDelay, ANIMATION_PRESETS.card.maxStaggerDelay))}
          >
            <Pressable
              onPress={() => handleActionPress(action.id)}
              className={`w-80 h-48 rounded-2xl overflow-hidden ${getActionColorClasses(action.colorScheme)}`}
            >
              <View className="p-5">
                <View className="flex-row items-center gap-2 mb-0">
                  <Text className="text-2xl">{action.icon}</Text>
                  <Text className="flex-1 text-lg font-bold tracking-widest text-gray-900 dark:text-white">{action.title}</Text>
                </View>
                <View className="space-y-2">
                  {action.bulletPoints.map((point, pointIndex) => (
                    <View key={pointIndex} className="flex-row">
                      <Text className="mr-2 text-sm text-gray-700 dark:text-gray-300">•</Text>
                      <Text className="flex-1 text-sm leading-5 text-gray-700 dark:text-gray-300">
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
