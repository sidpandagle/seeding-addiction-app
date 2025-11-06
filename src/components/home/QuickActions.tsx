import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { QUICK_ACTIONS, getActionColorClasses, getActionDividerBorderColor, getQuickActionCategory } from '../../data/quickActionData';

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
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => handleActionPress(action.id)}
            className={`w-80 rounded-2xl overflow-hidden ${getActionColorClasses(action.colorScheme)}`}
          >
            <View className="p-5">
              <View className="flex-row items-center gap-2 mb-0">
                <Text className="text-2xl">{action.icon}</Text>
                <Text className="flex-1 text-lg font-bold tracking-widest text-gray-900 dark:text-white">{action.title}</Text>
              </View>
              <Text className="mb-4 text-sm italic leading-5 text-gray-600 dark:text-gray-400">
                {action.role}
              </Text>
              <View className="space-y-2">
                {action.bulletPoints.map((point, index) => (
                  <View key={index} className="flex-row">
                    <Text className="mr-2 text-sm text-gray-700 dark:text-gray-300">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-700 dark:text-gray-300">
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View className={`border-t px-5 pt-3 pb-4 ${getActionDividerBorderColor(action.colorScheme)}`}>
              <Text className="text-sm italic leading-5 text-gray-600 dark:text-gray-400">
                {action.supportiveMessage}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
