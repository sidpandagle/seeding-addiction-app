import React, { memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { QUICK_ACTIONS, getActionColorClasses } from '../../data/quickActionData';

/**
 * Quick action cards to help users resist urges
 * Condensed version of emergency help actions for proactive home screen display
 */
const QuickActionsComponent: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <View className="px-6 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Quick Actions to Resist Urges
          </Text>
        </View>
      </View>

      {/* Action Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
      >
        {QUICK_ACTIONS.map((action) => (
          <View 
            key={action.id}
            className={`p-4 w-72 rounded-2xl ${getActionColorClasses(action.colorScheme)}`}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xl">{action.icon}</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">{action.title}</Text>
            </View>
            <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
              {action.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Export memoized version
export const QuickActions = memo(QuickActionsComponent);
