import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRelapseStore } from '../stores/relapseStore';
import { useThemeStore } from '../stores/themeStore';
import * as Haptics from 'expo-haptics';

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
  const colorScheme = useThemeStore((state) => state.colorScheme);

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

      // Gentle haptic feedback for relapse logging
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView className="flex-1">
        {/* Header with wither animation */}
        <View className="px-6 pt-16 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingRelapse ? 'Edit Relapse' : 'Log Relapse'}
          </Text>
          {!existingRelapse && (
            <Text className="mt-2 text-sm text-gray-500 font-regular dark:text-gray-400">
              Remember: Every journey has setbacks. What matters is getting back up.
            </Text>
          )}
        </View>

        {/* Timestamp Display (only for editing existing relapse) */}
        {existingRelapse && (
          <View className="px-6 mt-6">
            <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</Text>
            <View className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
              <Text className="text-base text-gray-900 font-regular dark:text-white">
                {new Date(timestamp!).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Note Input */}
        <View className="px-6 mt-6">
          <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about this relapse..."
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={4}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        {/* Tags */}
        <View className="px-6 mt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Tags (Optional)</Text>
          <View className="flex-row flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full ${selectedTags.includes(tag)
                    ? 'bg-emerald-600 dark:bg-emerald-700'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${selectedTags.includes(tag)
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

        {/* Action Buttons */}
        <View className="gap-4 px-6 mt-8 mb-8">
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${isSubmitting ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800'}`}
          >
            <Text className="text-lg font-semibold text-center text-white">
              {isSubmitting ? 'Saving...' : existingRelapse ? 'Update' : 'Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${isSubmitting ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'}`}
          >
            <Text className={`text-center font-semibold text-lg ${isSubmitting ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
