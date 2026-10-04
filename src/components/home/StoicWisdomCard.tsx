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
  Gem
} from 'lucide-react-native';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { getRandomTeaching, type StoicTeaching } from '../../data/stoicTeachings';
import { getCategoryIcon } from '../../constants/categoryColors';

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
 * Displays a random stoic teaching on a neutral card, with a category chip and faint background icon
 * Auto-refreshes on component mount
 */
const StoicWisdomCardComponent: React.FC = () => {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());

  // Refresh teaching on mount (each time user visits home page)
  useEffect(() => {
    setCurrentTeaching(getRandomTeaching());
  }, []);

  // Get the icon component for the current category
  const iconName = getCategoryIcon(currentTeaching.category);
  const IconComponent = ICON_MAP[iconName];

  // Refresh quote handler
  const refreshQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTeaching(getRandomTeaching());
  };

  return (
    <View className="px-6 pb-0">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <Brain size={24} color={colors.primary} strokeWidth={2} />
        <Text className="text-lg font-bold text-fg">
          Boosters for the Mind
        </Text>
      </View>

      {/* Quote Card - Tap to refresh */}
      <Pressable onPress={refreshQuote} style={cardShadow} className="rounded-[20px]">
        <View className="relative items-start p-5 overflow-hidden border bg-surface border-border rounded-[20px]">
          {/* Background Icon */}
          {IconComponent && (
            <View className="absolute bottom-[-14px] right-[-14px] opacity-10">
              <IconComponent size={110} color={colors.primary} strokeWidth={1.5} />
            </View>
          )}
          <View className="px-2.5 py-1 mb-3 rounded-full bg-primary-soft">
            <Text className="text-xs font-bold tracking-wider uppercase text-primary-ink">
              {currentTeaching.category}
            </Text>
          </View>
          <Text className="mb-3 text-lg font-bold text-fg">
            "{currentTeaching.quote}"
          </Text>
          <Text className="text-base font-semibold text-muted">
            — {currentTeaching.author}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

// Export memoized version
export const StoicWisdomCard = memo(StoicWisdomCardComponent);
