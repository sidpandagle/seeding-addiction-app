import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useUrgeStore } from '../stores/urgeStore';
import { useColorScheme } from '../stores/themeStore';
import * as Haptics from 'expo-haptics';
import { Shield } from 'lucide-react-native';

interface UrgeModalProps {
  onClose: () => void;
}

const CONTEXT_OPTIONS = ['Stress', 'Boredom', 'Trigger', 'Social', 'Tired', 'Anxious', 'Other'];

export default function UrgeModal({ onClose }: UrgeModalProps) {
  const { addUrge } = useUrgeStore();
  const colorScheme = useColorScheme();

  const [note, setNote] = useState('');
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleContext = (context: string) => {
    setSelectedContext((prev) =>
      prev.includes(context) ? prev.filter((c) => c !== context) : [...prev, context]
    );
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      await addUrge({
        timestamp: new Date().toISOString(),
        note: note.trim() || undefined,
        context: selectedContext.length > 0 ? selectedContext.join(', ') : undefined,
      });

      // Brief delay for feedback
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Failed to save urge:', error);
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
        <View className="px-6 pt-16 pb-6 bg-blue-50 dark:bg-gray-900">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
              Urge Resisted! 💪
            </Text>
            <View className="items-center justify-center w-12 h-12 bg-white rounded-2xl dark:bg-gray-800">
              <Shield size={24} color="#3b82f6" strokeWidth={2.5} />
            </View>
          </View>
          <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
            Great job resisting! Track it here to see your progress.
          </Text>
        </View>

        {/* Content Card */}
        <View className="px-6 mt-6">
          <View className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            {/* Note Input */}
            <View className="mb-6">
              <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                How did you overcome it? (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g., Went for a walk, called a friend..."
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
                textAlignVertical="top"
              />
            </View>

            {/* Context Selection */}
            <View>
              <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                What triggered the urge? (Optional)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CONTEXT_OPTIONS.map((context) => (
                  <Pressable
                    key={context}
                    onPress={() => toggleContext(context)}
                    className={`px-4 py-2.5 rounded-full ${
                      selectedContext.includes(context)
                        ? 'bg-blue-600 dark:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedContext.includes(context)
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {context}
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
            className={`rounded-2xl py-4 ${
              isSubmitting
                ? 'bg-blue-400 dark:bg-blue-600'
                : 'bg-blue-600 dark:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800'
            }`}
          >
            <Text className="text-lg font-bold text-center text-white">
              {isSubmitting ? 'Saving...' : 'Log Victory'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 ${
              isSubmitting
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
            }`}
          >
            <Text
              className={`text-center font-bold text-lg ${
                isSubmitting ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
