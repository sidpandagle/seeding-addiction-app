import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRelapseStore, useLatestRelapseTimestamp } from '../../stores/relapseStore';
import { useColorScheme } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';
import { AlertCircle, Leaf, CheckCircle } from 'lucide-react-native';
import { getRandomTip, type EducationalTip } from '../../data/educationalContent';
import { RELAPSE_TAGS } from '../../constants/tags';

interface RelapseModalProps {
  onClose: () => void;
  existingRelapse?: {
    id: string;
    timestamp: string;
    note?: string;
    tags?: string[];
  };
}

export default function RelapseModal({ onClose, existingRelapse }: RelapseModalProps) {
  const { addRelapse, updateRelapse } = useRelapseStore();
  const colorScheme = useColorScheme();
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  const [note, setNote] = useState(existingRelapse?.note || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingRelapse?.tags || []);
  const [timestamp] = useState(existingRelapse?.timestamp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryTip, setRecoveryTip] = useState<EducationalTip>(getRandomTip('relapse'));

  // Calculate current streak in days
  const currentStreakDays = latestRelapseTimestamp
    ? Math.floor((new Date().getTime() - new Date(latestRelapseTimestamp).getTime()) / (1000 * 60 * 60 * 24))
    : -1; // -1 means no relapse history, infinite streak

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };



  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      if (existingRelapse) {
        // Updating existing relapse - no need to reset notifications
        await updateRelapse(existingRelapse.id, {
          note: note.trim() || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
      } else {
        // Adding new relapse - this resets the journey
        const relapseTimestamp = new Date().toISOString();

        await addRelapse({
          timestamp: relapseTimestamp,
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
        <View className="px-6 pt-16 pb-0">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex">
              <Text className="mb-1 text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                {existingRelapse ? 'Edit Relapse' : 'Log Relapse'}
              </Text>
              {!existingRelapse && (
                <View className="flex-row items-center gap-2">
                  <AlertCircle size={20} color="#f59e0b" strokeWidth={2.5} />
                  <Text className="text-base tracking-wide text-amber-700 dark:text-amber-300">
                    Think Before You Log
                  </Text>
                </View>
              )}
            </View>
            <View className="items-center justify-center w-16 h-16 bg-white rounded-2xl dark:bg-gray-800">
              <Leaf size={34} color="#f59e0b" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Recovery & Compassion Section - Only for new relapses */}
        {!existingRelapse && (
          <View className="px-5 mt-6">
            {/* Current Streak Display */}
            {currentStreakDays >= 0 && (
              <View className="p-4 mb-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <Text className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-300 mb-1">
                  Your Current Plant
                </Text>
                <Text className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {currentStreakDays} day{currentStreakDays !== 1 ? 's' : ''} clean
                </Text>
                <Text className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  This is what you're cutting down by relapsing.
                </Text>
              </View>
            )}

            {/* Recovery Tip Card - Consequence-Focused */}
            <View className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <Text className="mb-2 text-lg font-bold text-amber-900 dark:text-amber-100">
                {recoveryTip.emoji} {recoveryTip.title}
              </Text>
              <Text className="text-sm leading-6 text-amber-800 dark:text-amber-200">
                {recoveryTip.content}
              </Text>
            </View>
          </View>
        )}

        {/* Content Card */}
        <View className={`px-4 ${existingRelapse ? 'mt-2' : 'mt-6'}`}>
          <View className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
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
              <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">What happened? (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Describe what led to this moment, how you're feeling..."
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
                textAlignVertical="top"
              />
            </View>

            {/* Tags */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  What triggered the urge? (Optional)
                </Text>
                <View className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {selectedTags.length} selected
                  </Text>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {RELAPSE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 dark:bg-emerald-700'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tag}
                      </Text>
                      {isSelected && (
                        <CheckCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-4 px-4 mt-4 mb-8">
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 ${isSubmitting
              ? 'bg-emerald-400 dark:bg-emerald-600'
              : 'bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800'
              }`}
          >
            <Text className="text-lg font-bold text-center text-white">
              {isSubmitting ? 'Alright then...' : existingRelapse ? 'Update' : 'Are you sure?'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 border border-gray-200 dark:border-gray-700 ${isSubmitting
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700'
              }`}
          >
            <Text className={`text-center font-bold text-lg ${isSubmitting ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Just Kidding
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
