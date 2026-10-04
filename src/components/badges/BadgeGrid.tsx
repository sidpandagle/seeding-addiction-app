import { View, Text, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Badge, BadgeCategory, EarnedBadge } from '../../db/schema';
import { Filter } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useReducedMotion, ANIMATION_PRESETS, getStaggerDelay } from '../../hooks/useReducedMotion';
import BadgeCard from './BadgeCard';
import CategoryFilterModal from './CategoryFilterModal';

interface BadgeGridProps {
  badges: Badge[];
  earnedBadgeIds: Set<string>;
  earnedBadges: EarnedBadge[]; // For featured section
  badgeProgress: Record<string, { progress: number; current: number; required: number }>;
  onBadgePress?: (badge: Badge) => void;
}

const CATEGORY_LABELS: Record<BadgeCategory | 'all', string> = {
  all: 'All Badges',
  frequency: 'Frequency',
  streak: 'Streaks',
  diversity: 'Diversity',
  milestone: 'Milestones',
  recovery: 'Recovery',
  special: 'Special',
};

export default function BadgeGrid({
  badges,
  earnedBadgeIds,
  earnedBadges,
  badgeProgress,
  onBadgePress,
}: Readonly<BadgeGridProps>) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter and sort badges - memoized to prevent recalculation on every render
  const sortedBadges = useMemo(() => {
    // Filter by category
    const filtered = selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

    // Sort: Earned first, then by progress, then alphabetically
    return [...filtered].sort((a, b) => {
      const aEarned = earnedBadgeIds.has(a.id);
      const bEarned = earnedBadgeIds.has(b.id);

      if (aEarned && !bEarned) return -1;
      if (!aEarned && bEarned) return 1;

      // If both locked, sort by progress
      if (!aEarned && !bEarned) {
        const aProgress = badgeProgress[a.id]?.progress || 0;
        const bProgress = badgeProgress[b.id]?.progress || 0;
        if (aProgress !== bProgress) return bProgress - aProgress;
      }

      return a.title.localeCompare(b.title);
    });
  }, [badges, selectedCategory, earnedBadgeIds, badgeProgress]);

  return (
    <View className="flex-1">
      {/* Unified Header: Badges Title + Count + Filter */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center justify-between p-4 mb-3 bg-surface border border-border rounded-xl">
          <View className="flex-1">
            <Text className="text-xl font-bold text-fg">
              Your Badges
            </Text>
            <Text className="mt-0.5 text-sm font-medium text-muted">
              {sortedBadges.length} {selectedCategory === 'all' ? 'total' : CATEGORY_LABELS[selectedCategory].toLowerCase()} badge{sortedBadges.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowFilterModal(true)}
            className="flex-row items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl"
          >
            <Filter size={18} color={colors.gold} strokeWidth={2.5} />
            <Text className="text-sm font-semibold text-fg">
              {selectedCategory === 'all' ? 'Filter' : CATEGORY_LABELS[selectedCategory]}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Badge Grid - Minimal circular badges */}
      <View className="flex-row flex-wrap px-4">
        {sortedBadges.map((badge, index) => {
          const isLocked = !earnedBadgeIds.has(badge.id);
          const progress = badgeProgress[badge.id];
          
          // Staggered entrance animation with capped delay
          const enteringAnimation = reducedMotion 
            ? undefined 
            : FadeIn.duration(ANIMATION_PRESETS.grid.duration).delay(
                getStaggerDelay(index, ANIMATION_PRESETS.grid.staggerDelay, ANIMATION_PRESETS.grid.maxStaggerDelay)
              );

          return (
            <Animated.View
              key={badge.id}
              entering={enteringAnimation}
              className="p-3"
              style={{ width: '33.33%' }}
            >
              <BadgeCard
                badge={badge}
                isLocked={isLocked}
                progress={progress?.progress}
                current={progress?.current}
                required={progress?.required}
                onPress={() => onBadgePress?.(badge)}
                staggerIndex={index}
              />
            </Animated.View>
          );
        })}
      </View>

      {sortedBadges.length === 0 && (
        <View className="items-center justify-center flex-1 px-6 py-12">
          <Text className="text-lg font-semibold text-center text-muted">
            No badges in this category yet
          </Text>
        </View>
      )}

      {/* Category Filter Modal */}
      <CategoryFilterModal
        visible={showFilterModal}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
}
