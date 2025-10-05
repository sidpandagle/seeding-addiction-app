import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRelapseStore } from '../stores/relapseStore';

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    try {
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
      onClose();
    } catch (error) {
      console.error('Failed to save relapse:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="pt-16 pb-6 px-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            {existingRelapse ? 'Edit Relapse' : 'Log Relapse'}
          </Text>
        </View>

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
            className="bg-blue-600 rounded-lg py-4 active:bg-blue-700"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {existingRelapse ? 'Update' : 'Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            className="bg-gray-200 rounded-lg py-4 active:bg-gray-300"
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
