import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useThemeStore } from '../../src/stores/themeStore';
import CircularProgress from '../../src/components/CircularProgress';
import { getJourneyStart } from '../../src/db/helpers';

const AVAILABLE_TAGS = ['Stress', 'Trigger', 'Social', 'Boredom', 'Craving', 'Other'];

export default function HistoryScreen() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  // Load journey start timestamp
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  const filteredRelapses = useMemo(() => {
    const sorted = [...relapses].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (selectedTag) {
      return sorted.filter((r) => r.tags?.includes(selectedTag));
    }
    return sorted;
  }, [relapses, selectedTag]);

  const stats = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      // No relapses - use journey start time
      startTime = journeyStart;
    } else {
      // Has relapses - use last relapse time
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    const elapsedTime = startTime ? Math.max(0, Date.now() - new Date(startTime).getTime()) : 0;
    const daysSinceLastRelapse = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));

    return {
      streak: daysSinceLastRelapse,
      total: relapses.length,
    };
  }, [relapses, journeyStart]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">History</Text>
        </View>

        {/* Summary Stats with Circular Progress */}
        <View className="flex-row items-center gap-4 mb-6">
          <View className="items-center">
            <CircularProgress
              size={80}
              strokeWidth={6}
              useGradient={true}
              gradientColors={['#1B5E20', '#FFD54F']}
              progress={Math.min(stats.streak / 30, 1)} // 30 days = 100%
              color="#1B5E20"
              backgroundColor="#E8F5E9"
            >
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{stats.streak}</Text>
                <Text className="text-xs font-regular text-gray-500 dark:text-gray-400">days</Text>
              </View>
            </CircularProgress>
          </View>
          <View className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Total Relapses</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</Text>
          </View>
        </View>

        {/* Tag Filters (only show in list view) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSelectedTag(null)}
              className={`px-3 py-2 rounded-full ${
                selectedTag === null ? 'bg-emerald-600 dark:bg-emerald-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTag === null ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </Text>
            </Pressable>
            {AVAILABLE_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setSelectedTag(tag)}
                className={`px-3 py-2 rounded-full ${
                  selectedTag === tag ? 'bg-emerald-600 dark:bg-emerald-700' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTag === tag ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content Views */}
      <FlatList
        data={filteredRelapses}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 py-4"
        ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-xl font-regular text-gray-400 dark:text-gray-500">No relapses recorded</Text>
              <Text className="mt-2 text-sm font-regular text-gray-400 dark:text-gray-500">
                {selectedTag ? 'Try a different filter' : 'Keep going strong!'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
              <View className="mb-2">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text className="text-sm font-regular text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {item.note && (
                <Text className="mb-2 text-sm font-regular text-gray-700 dark:text-gray-300">{item.note}</Text>
              )}

              {item.tags && item.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {item.tags.map((tag: string) => (
                    <View key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      <Text className="text-xs font-regular text-gray-600 dark:text-gray-300">{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
    </View>
  );
}
