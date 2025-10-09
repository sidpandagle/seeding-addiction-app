import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useUrgeStore } from '../stores/urgeStore';
import { useThemeStore } from '../stores/themeStore';
import * as Haptics from 'expo-haptics';

interface UrgeModalProps {
  onClose: () => void;
}

const CONTEXT_OPTIONS = ['Stress', 'Boredom', 'Trigger', 'Social', 'Tired', 'Anxious', 'Other'];

export default function UrgeModal({ onClose }: UrgeModalProps) {
  const { addUrge } = useUrgeStore();
  const colorScheme = useThemeStore((state) => state.colorScheme);

  const [note, setNote] = useState('');
  const [selectedContext, setSelectedContext] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Positive haptic feedback for resisting an urge
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addUrge({
        timestamp: new Date().toISOString(),
        note: note.trim() || undefined,
        context: selectedContext,
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
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Urge Resisted! 💪
          </Text>
          <Text className="mt-2 text-sm text-gray-500 font-regular dark:text-gray-400">
            Great job resisting! Track it here to see your progress.
          </Text>
        </View>

        {/* Note Input */}
        <View className="px-6 mt-6">
          <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            How did you overcome it? (Optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g., Went for a walk, called a friend..."
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={4}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        {/* Context Selection */}
        <View className="px-6 mt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            What triggered the urge? (Optional)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CONTEXT_OPTIONS.map((context) => (
              <Pressable
                key={context}
                onPress={() => setSelectedContext(selectedContext === context ? undefined : context)}
                className={`px-4 py-2 rounded-full ${
                  selectedContext === context
                    ? 'bg-blue-600 dark:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedContext === context
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

        {/* Action Buttons */}
        <View className="gap-4 px-6 mt-8 mb-8">
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${
              isSubmitting
                ? 'bg-blue-400 dark:bg-blue-600'
                : 'bg-blue-600 dark:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800'
            }`}
          >
            <Text className="text-lg font-semibold text-center text-white">
              {isSubmitting ? 'Saving...' : 'Log Victory'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-lg py-4 ${
              isSubmitting
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
            }`}
          >
            <Text
              className={`text-center font-semibold text-lg ${
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
