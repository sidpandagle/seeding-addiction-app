import { SectionList, View, Text, Pressable, ScrollView } from 'react-native';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { HistoryEntry } from '../../types/history';
import type { Relapse } from '../../db/schema';
import { filterValidCategories, formatRelapseTag } from '../../constants/tags';
import { useReducedMotion, ANIMATION_PRESETS, getStaggerDelay } from '../../hooks/useReducedMotion';
import { useCustomActivityTagsStore } from '../../stores/customActivityTagsStore';
import { EntryCard } from './EntryCard';

interface HistoryListProps {
  entries: HistoryEntry[];
  /** Relapse id -> length of the streak it ended */
  endedStreakMs?: Map<string, number>;
  onEditRelapse?: (relapse: Relapse) => void;
}

interface MonthSection {
  key: string;
  title: string;
  data: HistoryEntry[];
}

// Only the first cards fade in, once, when the list opens
const ANIMATED_ENTRIES = 8;
const ENTRANCE_WINDOW_MS = 1000;

function groupByMonth(entries: HistoryEntry[]): MonthSection[] {
  const sections: MonthSection[] = [];
  for (const entry of entries) {
    const date = new Date(entry.data.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let section = sections[sections.length - 1];
    if (!section || section.key !== key) {
      section = { key, title: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), data: [] };
      sections.push(section);
    }
    section.data.push(entry);
  }
  return sections;
}

export default function HistoryList({ entries, endedStreakMs, onEditRelapse }: HistoryListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const customTags = useCustomActivityTagsStore(state => state.customTags);

  // Cards that remount while scrolling must not animate again
  const [animateEntrance, setAnimateEntrance] = useState(!reducedMotion);
  useEffect(() => {
    const timer = setTimeout(() => setAnimateEntrance(false), ENTRANCE_WINDOW_MS);
    return () => clearTimeout(timer);
  }, []);

  // Get all unique tags/categories AND their counts in a single pass (O(n) instead of O(n²))
  const { allTags, tagCounts } = useMemo(() => {
    const tags = new Set<string>();
    const counts: Record<string, { relapse: number; activity: number }> = {};

    entries.forEach(entry => {
      if (entry.type === 'relapse' && entry.data.tags) {
        entry.data.tags.forEach(tag => {
          tags.add(tag);
          if (!counts[tag]) counts[tag] = { relapse: 0, activity: 0 };
          counts[tag].relapse++;
        });
      } else if (entry.type === 'activity' && entry.data.categories) {
        const validCategories = filterValidCategories(entry.data.categories, customTags);
        validCategories.forEach(category => {
          tags.add(category);
          if (!counts[category]) counts[category] = { relapse: 0, activity: 0 };
          counts[category].activity++;
        });
      }
    });

    return {
      allTags: Array.from(tags).sort(),
      tagCounts: counts,
    };
  }, [entries, customTags]);

  const filteredEntries = useMemo(() => {
    if (!selectedTag) return entries;
    return entries.filter(e => {
      if (e.type === 'relapse') {
        return e.data.tags?.includes(selectedTag);
      }
      // Only match valid categories
      return e.data.categories ? filterValidCategories(e.data.categories, customTags).includes(selectedTag) : false;
    });
  }, [entries, selectedTag, customTags]);

  const sections = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);

  const renderItem = useCallback(({ item, index, section }: { item: HistoryEntry; index: number; section: MonthSection }) => {
    const animate = animateEntrance && section === sections[0] && index < ANIMATED_ENTRIES;
    const categories = item.type === 'activity' && item.data.categories
      ? filterValidCategories(item.data.categories, customTags)
      : undefined;

    return (
      <Animated.View
        entering={animate
          ? FadeInUp.duration(ANIMATION_PRESETS.list.duration).delay(
              getStaggerDelay(index, ANIMATION_PRESETS.list.staggerDelay, ANIMATION_PRESETS.list.maxStaggerDelay)
            )
          : undefined}
        className="mx-6 mb-4"
      >
        <EntryCard
          entry={item}
          categories={categories}
          endedStreakMs={item.type === 'relapse' ? endedStreakMs?.get(item.data.id) : undefined}
          onEditRelapse={onEditRelapse}
        />
      </Animated.View>
    );
  }, [animateEntrance, sections, customTags, endedStreakMs, onEditRelapse]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.data.id}
      renderItem={renderItem}
      stickySectionHeadersEnabled
      contentContainerClassName="pb-4"
      // Virtualization: draw a screenful first, keep a few screens mounted.
      // No getItemLayout: cards vary in height with notes and tags.
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      renderSectionHeader={({ section }) => (
        <View className="flex-row items-center justify-between px-6 pt-2 pb-3 bg-bg">
          <Text className="text-xs font-bold tracking-wide text-muted uppercase">
            {section.title}
          </Text>
          <Text className="text-xs font-medium text-faint">
            {section.data.length} {section.data.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <View className="px-6 pt-4 pb-5 mb-2">
          {/* Tag/Category Filter */}
          <Text className="mb-4 text-xs font-bold tracking-wide text-muted uppercase">
            Filter by Tag/Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2.5">
              <Pressable
                onPress={() => setSelectedTag(null)}
                className={`px-5 py-3 rounded-full ${selectedTag === null
                    ? 'bg-info-soft border border-info/30'
                    : 'bg-surface border border-border'
                  }`}
              >
                <Text
                  className={`text-sm font-bold ${selectedTag === null ? 'text-info' : 'text-body'
                    }`}
                >
                  All
                </Text>
              </Pressable>
              {allTags.map((tag) => {
                // Use pre-calculated counts (O(1) lookup instead of O(n) filter)
                const counts = tagCounts[tag] || { relapse: 0, activity: 0 };
                const totalCount = counts.relapse + counts.activity;

                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedTag(tag)}
                    className={`px-5 py-3 rounded-full ${selectedTag === tag
                        ? 'bg-info-soft border border-info/30'
                        : 'bg-surface border border-border'
                      }`}
                  >
                    <Text
                      className={`text-sm font-bold ${selectedTag === tag ? 'text-info' : 'text-body'
                        }`}
                    >
                      {counts.relapse > 0 ? formatRelapseTag(tag) : tag} {totalCount > 0 && `(${totalCount})`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center justify-center px-6 py-16">
          <View className="items-center justify-center w-24 h-24 mb-6 bg-info-soft rounded-2xl">
            <Text className="font-regular text-5xl">{selectedTag ? '🔍' : '✨'}</Text>
          </View>
          <Text className="mb-3 text-xl font-bold text-center text-fg">
            {selectedTag ? 'No matches found' : 'Your journey starts here'}
          </Text>
          <Text className="max-w-sm mb-6 text-sm leading-6 text-center text-muted font-regular">
            {selectedTag
              ? 'No entries match this filter. Try selecting a different tag or view all entries.'
              : 'Track activities and relapses to see your complete journey timeline. Every step matters!'}
          </Text>
          {!selectedTag && (
            <View className="w-full max-w-sm p-4 border bg-primary-soft border-primary/30 rounded-xl">
              <Text className="mb-2 text-sm font-bold text-center text-primary-ink">
                💡 Quick Tip
              </Text>
              <Text className="text-xs leading-5 text-center font-regular text-primary-ink">
                Go to the Home tab and tap "Log a win" to log your first activity
              </Text>
            </View>
          )}
        </View>
      }
    />
  );
}
