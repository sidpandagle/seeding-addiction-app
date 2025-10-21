import { FlatList, View, Text, Pressable, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import type { HistoryEntry } from '../../types/history';
import { RELAPSE_TAGS, URGE_CONTEXTS } from '../../constants/tags';

interface HistoryListProps {
  entries: HistoryEntry[];
}

export default function HistoryList({ entries }: HistoryListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags/contexts from both relapses and urges
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    
    // Add relapse tags
    entries.forEach(entry => {
      if (entry.type === 'relapse' && entry.data.tags) {
        entry.data.tags.forEach(tag => tags.add(tag));
      }
    });
    
    // Add urge contexts
    entries.forEach(entry => {
      if (entry.type === 'urge' && entry.data.context) {
        // Split comma-separated contexts
        entry.data.context.split(',').forEach(ctx => tags.add(ctx.trim()));
      }
    });
    
    return Array.from(tags).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by tag (applies to both relapses and urges)
    if (selectedTag) {
      filtered = filtered.filter(e => {
        if (e.type === 'relapse') {
          return e.data.tags?.includes(selectedTag);
        } else if (e.type === 'urge' && e.data.context) {
          // Check if the context string contains the selected tag
          return e.data.context.split(',').map(c => c.trim()).includes(selectedTag);
        }
        return false;
      });
    }

    return filtered;
  }, [entries, selectedTag]);

  return (
    <FlatList
      data={filteredEntries}
      keyExtractor={(item) => item.data.id}
      contentContainerClassName="pb-4"
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      getItemLayout={(data, index) => ({
        length: 120, // Approximate item height
        offset: 120 * index,
        index,
      })}
      ListHeaderComponent={
        <View className="px-6 pt-4 pb-5 mb-2">
          {/* Tag/Context Filter */}
          <Text className="mb-4 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Filter by Tag/Trigger
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2.5">
              <Pressable
                onPress={() => setSelectedTag(null)}
                className={`px-5 py-3 rounded-2xl ${selectedTag === null
                    ? 'bg-blue-600 dark:bg-blue-600'
                    : 'bg-white dark:bg-gray-900'
                  }`}
              >
                <Text
                  className={`text-sm font-bold ${selectedTag === null ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  All
                </Text>
              </Pressable>
              {allTags.map((tag) => {
                const relapseCount = entries.filter((e) => e.type === 'relapse' && e.data.tags?.includes(tag)).length;
                const urgeCount = entries.filter((e) => e.type === 'urge' && e.data.context?.split(',').map(c => c.trim()).includes(tag)).length;
                const totalCount = relapseCount + urgeCount;
                
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedTag(tag)}
                    className={`px-5 py-3 rounded-2xl ${selectedTag === tag
                        ? 'bg-blue-600 dark:bg-blue-600'
                        : 'bg-white dark:bg-gray-900'
                      }`}
                  >
                    <Text
                      className={`text-sm font-bold ${selectedTag === tag ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {tag} {totalCount > 0 && `(${totalCount})`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center justify-center px-6 py-20">
          <View className="items-center justify-center w-24 h-24 mb-5 bg-blue-50 dark:bg-blue-900/30 rounded-3xl">
            <Text className="text-5xl">✨</Text>
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {selectedTag ? 'No matches found' : 'No entries recorded'}
          </Text>
          <Text className="text-sm text-center text-gray-500 dark:text-gray-400">
            {selectedTag ? 'Try adjusting your filters' : 'Start your journey by tracking events'}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const isRelapse = item.type === 'relapse';
        const data = item.data;

        return (
          <View className="relative p-6 mx-6 mb-4 overflow-hidden bg-white border border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900 rounded-3xl">
            {/* Gradient accent - different colors for relapse vs urge */}
            {isRelapse ? (
              <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400" />
            ) : (
              <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
            )}

            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(data.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base">🕐</Text>
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(data.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              {/* Entry type badge */}
              <View className={`px-4 py-2 rounded-xl ${isRelapse ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                <Text className={`text-xs font-bold ${isRelapse ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                  {isRelapse ? '📍 Relapse' : '🎯 Urge Resisted'}
                </Text>
              </View>
            </View>

            {data.note && (
              <View className="p-4 mb-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {data.note}
                </Text>
              </View>
            )}

            {/* Show tags for relapses or context for urges */}
            {isRelapse && item.data.tags && item.data.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-2">
                {item.data.tags.map((tag: string) => (
                  <View
                    key={tag}
                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
                  >
                    <Text className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!isRelapse && item.data.context && (
              <View className="flex-row flex-wrap gap-2 mt-2">
                <View className="px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-xl">
                  <Text className="text-xs font-bold text-green-700 dark:text-green-300">
                    Context: {item.data.context}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}
