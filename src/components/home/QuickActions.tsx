import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { QUICK_ACTIONS, getActionColorClasses, getQuickActionCategory } from '../../data/quickActionData';

interface QuickActionsProps {
  onActionPress?: (categories: string[]) => void;
}

/**
 * Quick action cards to help users resist urges
 * Condensed version of emergency help actions for proactive home screen display
 */
const QuickActionsComponent: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  const colorScheme = useColorScheme();

  const handleActionPress = (actionId: string) => {
    if (onActionPress) {
      const category = getQuickActionCategory(actionId);
      onActionPress(category ? [category] : []);
    }
  };

  return (
    <View className="px-6 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Healthy Distractions
          </Text>
        </View>
      </View>

      {/* Action Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-6"
      >
        {QUICK_ACTIONS.map((action) => {
          // Split description into bullet points (sentences)
          const bullets = action.description
            .split('.')
            .map(s => s.trim())
            .filter(s => s.length > 0);

          return (
            <Pressable
              key={action.id}
              onPress={() => handleActionPress(action.id)}
              className={`p-5 w-64 rounded-2xl ${getActionColorClasses(action.colorScheme)} active:opacity-70`}
            >
              {/* Centered Icon */}
              <View className="items-center mb-3">
                <Text className="text-5xl">{action.icon}</Text>
              </View>

              {/* Title */}
              <Text className="mb-3 text-base font-bold text-center text-gray-900 dark:text-white">
                {action.title}
              </Text>

              {/* Bulleted Content */}
              <View className="gap-1.5">
                {bullets.map((bullet, index) => (
                  <View key={index} className="flex-row">
                    <Text className="mr-2 text-sm text-gray-600 dark:text-gray-400">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-700 dark:text-gray-300">
                      {bullet}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
