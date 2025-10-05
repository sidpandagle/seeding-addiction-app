import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { MotiView } from 'moti';
import { useRelapseStore } from '../stores/relapseStore';
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
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1">
        {/* Header with wither animation */}
        <MotiView
          from={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: isSubmitting && !existingRelapse ? 0.3 : 1,
            scale: isSubmitting && !existingRelapse ? 0.9 : 1,
          }}
          transition={{
            type: 'timing',
            duration: 300,
          }}
        >
          <View className="pt-16 pb-6 px-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">
              {existingRelapse ? 'Edit Relapse' : 'Log Relapse'}
            </Text>
            {!existingRelapse && (
              <Text className="mt-2 text-sm text-gray-500">
                Remember: Every journey has setbacks. What matters is getting back up.
              </Text>
            )}
          </View>
        </MotiView>

        {/* Timestamp Display (only for editing existing relapse) */}
        {existingRelapse && (
          <View className="px-6 mt-6">
            <Text className="text-sm text-gray-500 mb-2">Timestamp</Text>
            <View className="bg-gray-100 rounded-lg p-4">
              <Text className="text-base text-gray-900">
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
          <Text className="text-sm text-gray-500 mb-2">Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about this relapse..."
            multiline
            numberOfLines={4}
            className="bg-gray-100 rounded-lg p-4 text-base text-gray-900 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        {/* Tags */}
        <View className="px-6 mt-6">
          <Text className="text-sm text-gray-500 mb-3">Tags (Optional)</Text>
          <View className="flex-row flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mt-8 mb-8 gap-3">
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isSubmitting ? 'Saving...' : existingRelapse ? 'Update' : 'Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${isSubmitting ? 'bg-gray-100' : 'bg-gray-200 active:bg-gray-300'}`}
          >
            <Text className={`text-center font-semibold text-lg ${isSubmitting ? 'text-gray-400' : 'text-gray-700'}`}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
