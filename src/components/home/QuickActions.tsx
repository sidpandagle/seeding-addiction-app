import React, { memo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Zap, Dumbbell, Wind, Focus, Target, type LucideIcon } from 'lucide-react-native';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { useReducedMotion, ANIMATION_PRESETS, getStaggerDelay } from '../../hooks/useReducedMotion';
import { QUICK_ACTIONS, getRandomBulletPoints, BULLET_POOLS, getQuickActionCategory, type QuickAction } from '../../data/quickActionData';

const ACTION_ICONS: Record<string, LucideIcon> = {
  'physical-reset': Dumbbell,
  'breathe': Wind,
  'mental-distraction': Focus,
  'remember-why': Target,
};

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
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
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
        className="flex-row items-center justify-between mb-4"
      >
        <View className="flex-row items-center gap-2">
          <Zap size={20} color={colors.primary} strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-fg">
            Healthy Distractions
          </Text>
        </View>
      </Animated.View>

      {/* Action Cards - Horizontal Scroll with staggered animations */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4"
      >
        {actions.map((action, index) => {
          const Icon = ACTION_ICONS[action.id] ?? Zap;
          return (
            <Animated.View
              key={action.id}
              entering={reducedMotion ? undefined : FadeInRight.duration(ANIMATION_PRESETS.card.duration).delay(getStaggerDelay(index, ANIMATION_PRESETS.card.staggerDelay, ANIMATION_PRESETS.card.maxStaggerDelay))}
              style={cardShadow}
              className="rounded-[20px]"
            >
              <Pressable
                onPress={() => handleActionPress(action.id)}
                className="grow p-5 overflow-hidden border w-80 min-h-44 bg-surface border-border rounded-[20px] active:bg-subtle"
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                    <Icon size={20} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <Text className="flex-1 text-lg font-bold text-fg">{action.title}</Text>
                </View>
                <View className="gap-1.5">
                  {action.bulletPoints.map((point, pointIndex) => (
                    <View key={pointIndex} className="flex-row items-start gap-2.5">
                      <View className="w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
                      <Text className="font-regular flex-1 text-sm text-body">{point}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
