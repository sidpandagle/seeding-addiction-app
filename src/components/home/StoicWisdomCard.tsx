import React, { memo, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Brain } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { getRandomTeaching, type StoicTeaching } from '../../data/stoicTeachings';
import { getCategoryBackgroundColor, getCategoryTextColor } from '../../constants/categoryColors';

/**
 * Stoic Wisdom Card component for home page
 * Displays random stoic teaching with category-based color coding
 * Auto-refreshes on component mount
 */
const StoicWisdomCardComponent: React.FC = () => {
  const colorScheme = useColorScheme();
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());

  // Refresh teaching on mount (each time user visits home page)
  useEffect(() => {
    setCurrentTeaching(getRandomTeaching());
  }, []);

  return (
    <View className="px-6 pb-0">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <Brain size={24} color="#059669" strokeWidth={2} />
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Stoic Wisdom
        </Text>
      </View>

      {/* Quote Card */}
      <View className={`p-6 rounded-2xl ${getCategoryBackgroundColor(currentTeaching.category)}`}>
        <Text className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {currentTeaching.category}
        </Text>
        <Text className={`text-lg font-bold leading-7 mb-4 ${getCategoryTextColor(currentTeaching.category)}`}>
          "{currentTeaching.quote}"
        </Text>
        <Text className="mb-4 text-base font-semibold text-gray-600 dark:text-gray-400">
          — {currentTeaching.author}
        </Text>
        <View className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <Text className="text-base leading-6 text-gray-700 dark:text-gray-300">
            {currentTeaching.explanation}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Export memoized version
export const StoicWisdomCard = memo(StoicWisdomCardComponent);
