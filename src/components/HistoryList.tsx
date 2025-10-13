import { FlatList, View, Text, Pressable, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import type { Relapse } from '../db/schema';

const AVAILABLE_TAGS = ['Stress', 'Trigger', 'Social', 'Boredom', 'Craving', 'Other'];

interface HistoryListProps {
  relapses: Relapse[];
}

export default function HistoryList({ relapses }: HistoryListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredRelapses = useMemo(() => {
    // Avoid re-sorting - relapses should already be sorted from DB query
    // Only sort if absolutely necessary
    const needsSorting = relapses.length > 1 && 
      new Date(relapses[0].timestamp).getTime() < new Date(relapses[1].timestamp).getTime();
    
    const sorted = needsSorting 
      ? [...relapses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : relapses;

    if (selectedTag) {
      return sorted.filter((r) => r.tags?.includes(selectedTag));
    }
    return sorted;
  }, [relapses, selectedTag]);

  return (
    <FlatList
      data={filteredRelapses}
      keyExtractor={(item) => item.id}
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
        <View className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Filter by Tag
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedTag(null)}
                className={`px-4 py-2.5 rounded-full ${
                  selectedTag === null
                    ? 'bg-emerald-600 dark:bg-emerald-600'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedTag === null ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All ({relapses.length})
                </Text>
              </Pressable>
              {AVAILABLE_TAGS.map((tag) => {
                const count = relapses.filter((r) => r.tags?.includes(tag)).length;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedTag(tag)}
                    className={`px-4 py-2.5 rounded-full ${
                      selectedTag === tag
                        ? 'bg-emerald-600 dark:bg-emerald-600'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedTag === tag ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tag} {count > 0 && `(${count})`}
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
          <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
            <Text className="text-3xl">✓</Text>
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {selectedTag ? 'No matches found' : 'No relapses recorded'}
          </Text>
          <Text className="text-sm text-center text-gray-500 dark:text-gray-400">
            {selectedTag ? 'Try selecting a different tag' : 'You\'re doing great! Keep up the good work.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="p-5 mx-6 mb-3 bg-white border border-gray-200 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {new Date(item.timestamp).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {item.note && (
            <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-300">
              {item.note}
            </Text>
          )}

          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <View
                  key={tag}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                >
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    />
  );
}
