import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRelapseStore } from '../src/stores/relapseStore';
import CircularProgress from '../src/components/CircularProgress';
import { getJourneyStart } from '../src/db/helpers';

const AVAILABLE_TAGS = ['Stress', 'Trigger', 'Social', 'Boredom', 'Craving', 'Other'];

export default function RelapsesScreen() {
  const router = useRouter();
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
    if (relapses.length === 0) {
      return { streak: 0, total: 0 };
    }

    const sortedRelapses = [...relapses].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const lastRelapse = sortedRelapses[0];
    const daysSinceLastRelapse = Math.floor(
      (Date.now() - new Date(lastRelapse.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      streak: daysSinceLastRelapse,
      total: relapses.length,
    };
  }, [relapses]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()}>
            <Text className="text-lg text-blue-600">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">History</Text>
          <View className="w-16" />
        </View>

        {/* Summary Stats with Circular Progress */}
        <View className="flex-row items-center gap-4 mb-4">
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
                <Text className="text-xl font-bold text-gray-900">{stats.streak}</Text>
                <Text className="text-xs text-gray-500">days</Text>
              </View>
            </CircularProgress>
          </View>
          <View className="flex-1 p-3 bg-gray-100 rounded-lg">
            <Text className="mb-1 text-xs text-gray-600">Total Relapses</Text>
            <Text className="text-2xl font-bold text-gray-900">{stats.total}</Text>
          </View>
        </View>

        {/* Tag Filters (only show in list view) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSelectedTag(null)}
              className={`px-3 py-2 rounded-full ${
                selectedTag === null ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTag === null ? 'text-white' : 'text-gray-700'
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
                  selectedTag === tag ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTag === tag ? 'text-white' : 'text-gray-700'
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
              <Text className="text-xl text-gray-400">No relapses recorded</Text>
              <Text className="mt-2 text-sm text-gray-400">
                {selectedTag ? 'Try a different filter' : 'Keep going strong!'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="p-4 mb-3 bg-white shadow-sm rounded-xl">
              <View className="mb-2">
                <Text className="text-base font-semibold text-gray-900">
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {item.note && (
                <Text className="mb-2 text-sm text-gray-700">{item.note}</Text>
              )}

              {item.tags && item.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {item.tags.map((tag: string) => (
                    <View key={tag} className="px-2 py-1 bg-gray-100 rounded">
                      <Text className="text-xs text-gray-600">{tag}</Text>
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
