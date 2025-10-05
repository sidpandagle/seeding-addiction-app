import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo } from 'react';
import { useRelapseStore } from '../src/stores/relapseStore';

const AVAILABLE_TAGS = ['Stress', 'Trigger', 'Social', 'Boredom', 'Craving', 'Other'];

export default function RelapsesScreen() {
  const router = useRouter();
  const { relapses } = useRelapseStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
      <View className="bg-white pt-16 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()}>
            <Text className="text-blue-600 text-lg">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">History</Text>
          <View className="w-16" />
        </View>

        {/* Summary Stats */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-blue-50 rounded-lg p-3">
            <Text className="text-xs text-gray-600 mb-1">Current Streak</Text>
            <Text className="text-2xl font-bold text-blue-600">{stats.streak}d</Text>
          </View>
          <View className="flex-1 bg-gray-100 rounded-lg p-3">
            <Text className="text-xs text-gray-600 mb-1">Total</Text>
            <Text className="text-2xl font-bold text-gray-900">{stats.total}</Text>
          </View>
        </View>

        {/* Tag Filters */}
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

      {/* Relapse List */}
      <FlatList
        data={filteredRelapses}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 py-4"
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-xl text-gray-400">No relapses recorded</Text>
            <Text className="text-sm text-gray-400 mt-2">
              {selectedTag ? 'Try a different filter' : 'Keep going strong!'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
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
              <Text className="text-sm text-gray-700 mb-2">{item.note}</Text>
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
