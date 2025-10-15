import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRelapseStore } from '../../stores/relapseStore';
import { useColorScheme } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';
import { RotateCcw } from 'lucide-react-native';

interface RelapseModalProps {
  onClose: () => void;
  existingRelapse?: {
    id: string;
    timestamp: string;
    note?: string;
    tags?: string[];
  };
}

const AVAILABLE_TAGS = ['Stress', 'Trigger', 'Social', 'Boredom', 'Craving', 'Other'];

export default function RelapseModal({ onClose, existingRelapse }: RelapseModalProps) {
  const { addRelapse, updateRelapse } = useRelapseStore();
  const colorScheme = useColorScheme();

  const [note, setNote] = useState(existingRelapse?.note || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingRelapse?.tags || []);
  const [timestamp] = useState(existingRelapse?.timestamp);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      if (existingRelapse) {
        await updateRelapse(existingRelapse.id, {
          note: note.trim() || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
      } else {
        await addRelapse({
          timestamp: new Date().toISOString(),
          note: note.trim() || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
      }

      // Brief delay for wither animation to be visible
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Failed to save relapse:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Modern Header */}
        <View className="px-6 pt-16 pb-6 bg-rose-50 dark:bg-gray-900">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
              {existingRelapse ? 'Edit Relapse' : 'Log Relapse'}
            </Text>
            <View className="items-center justify-center w-12 h-12 bg-white rounded-2xl dark:bg-gray-800">
              <RotateCcw size={24} color="#f43f5e" strokeWidth={2.5} />
            </View>
          </View>
          {!existingRelapse && (
            <Text className="mt-1 text-sm font-medium text-rose-700 dark:text-rose-400">
              Every journey has setbacks. What matters is getting back up.
            </Text>
          )}
        </View>

        {/* Content Card */}
        <View className="px-6 mt-6">
          <View className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            {/* Timestamp Display (only for editing existing relapse) */}
            {existingRelapse && (
              <View className="mb-6">
                <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Timestamp</Text>
                <View className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(timestamp!).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>
              </View>
            )}

            {/* Note Input */}
            <View className="mb-6">
              <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Note (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add any notes about this relapse..."
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
                textAlignVertical="top"
              />
            </View>

            {/* Tags */}
            <View>
              <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Tags (Optional)</Text>
              <View className="flex-row flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-4 py-2.5 rounded-full ${selectedTags.includes(tag)
                        ? 'bg-emerald-600 dark:bg-emerald-700'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${selectedTags.includes(tag)
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 px-6 mt-6 mb-8">
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 ${isSubmitting ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800'}`}
          >
            <Text className="text-lg font-bold text-center text-white">
              {isSubmitting ? 'Saving...' : existingRelapse ? 'Update' : 'Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 ${isSubmitting ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'}`}
          >
            <Text className={`text-center font-bold text-lg ${isSubmitting ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
