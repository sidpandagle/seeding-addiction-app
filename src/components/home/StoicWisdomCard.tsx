import React, { memo, useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Brain,
  Target,
  Compass,
  Anchor,
  Crosshair,
  Dumbbell,
  Shield,
  Zap,
  Flame,
  Mountain,
  TreePine,
  BookOpen,
  Lightbulb,
  Glasses,
  Heart,
  Star,
  Crown,
  Gem,
  RefreshCw
} from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { getRandomTeaching, type StoicTeaching } from '../../data/stoicTeachings';
import {
  getCategoryBackgroundColor,
  getCategoryTextColor,
  getCategoryIcon,
  getCategoryIconColor
} from '../../constants/categoryColors';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Target,
  Compass,
  Anchor,
  Crosshair,
  Dumbbell,
  Shield,
  Zap,
  Flame,
  Mountain,
  TreePine,
  BookOpen,
  Lightbulb,
  Glasses,
  Heart,
  Star,
  Crown,
  Gem,
};

/**
 * Stoic Wisdom Card component for home page
 * Displays random stoic teaching with category-based color coding and background icon
 * Auto-refreshes on component mount
 */
const StoicWisdomCardComponent: React.FC = () => {
  const colorScheme = useColorScheme();
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());

  // Refresh teaching on mount (each time user visits home page)
  useEffect(() => {
    setCurrentTeaching(getRandomTeaching());
  }, []);

  // Get the icon component for the current category
  const iconName = getCategoryIcon(currentTeaching.category);
  const IconComponent = ICON_MAP[iconName];
  const iconColor = getCategoryIconColor(currentTeaching.category);

  // Refresh quote handler
  const refreshQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTeaching(getRandomTeaching());
  };

  return (
    <View className="px-6 pb-0">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <Brain size={24} color="#059669" strokeWidth={2} />
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Boosters for the Mind
        </Text>
      </View>

      {/* Quote Card - Tap to refresh */}
      <Pressable onPress={refreshQuote}>
        <View className={`relative overflow-hidden p-6 rounded-2xl ${getCategoryBackgroundColor(currentTeaching.category)}`}>
          {/* Background Icon */}
          {IconComponent && (
            <View className="absolute bottom-[-12px] right-[-12px] opacity-15 dark:opacity-15">
              <IconComponent size={100} color={iconColor} strokeWidth={1.5} />
            </View>
          )}
          <Text className={`text-lg font-bold leading-7 mb-4 ${getCategoryTextColor(currentTeaching.category)}`}>
            "{currentTeaching.quote}"
          </Text>
          <Text className="text-base font-semibold dark:text-white">
            — {currentTeaching.author}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

// Export memoized version
export const StoicWisdomCard = memo(StoicWisdomCardComponent);
