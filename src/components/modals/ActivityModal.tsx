import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useActivityStore } from '../../stores/activityStore';
import { useColorScheme } from '../../stores/themeStore';
// Icon options for Activity Modal header (current: SmilePlus)
// Available alternatives: Sparkles, Heart, Award, Trophy, Star, Zap
import { SmilePlus, CheckCircle } from 'lucide-react-native';
import { getRandomTip, type EducationalTip } from '../../data/educationalContent';
import { ACTIVITY_CATEGORIES } from '../../constants/tags';

interface ActivityModalProps {
  onClose: () => void;
  preSelectedCategories?: string[]; // For Quick Actions integration
}

export default function ActivityModal({ onClose, preSelectedCategories = [] }: ActivityModalProps) {
  const { addActivity } = useActivityStore();
  const colorScheme = useColorScheme();

  const [note, setNote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preSelectedCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityTip, setActivityTip] = useState<EducationalTip>(getRandomTip('activity'));

  // Toggle category selection (multi-select)
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      await addActivity({
        timestamp: new Date().toISOString(),
        note: note.trim() || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });

      // Brief delay for feedback
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Failed to save activity:', error);
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
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                Great Choice! ✨
              </Text>
              <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                Track your positive action
              </Text>
            </View>
            <View className="items-center justify-center w-16 h-16 bg-white rounded-2xl dark:bg-gray-900">
              <SmilePlus size={34} color="#3b82f6" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Activity Encouragement Section */}
        <View className="px-5 mt-6">
          {/* Activity Tip Card */}
          <View className="p-4 mb-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl">
            <Text className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-100">
              {activityTip.emoji} {activityTip.title}
            </Text>
            <Text className="text-sm leading-6 text-blue-800 dark:text-blue-200">
              {activityTip.content}
            </Text>
          </View>
        </View>

        {/* Content Card */}
        <View className="px-4 mt-2">
          <View className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            {/* Note Input */}
            <View className="mb-6">
              <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                What did you do? (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g., Worked out for 30 mins, went for a walk..."
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-base font-regular text-gray-900 dark:text-white min-h-[100px]"
                textAlignVertical="top"
              />
            </View>

            {/* Category Selection */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Activity Type (Optional)
                </Text>
                <View className="px-2 py-1 bg-blue-100 rounded-full dark:bg-blue-900/30">
                  <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {selectedCategories.length} selected
                  </Text>
                </View>
              </View>
              {/* Badge Layout - Free flowing */}
              <View className="flex-row flex-wrap gap-2">
                {ACTIVITY_CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <Pressable
                      key={category}
                      onPress={() => toggleCategory(category)}
                      className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 dark:bg-blue-800/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {category}
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
              ? 'bg-blue-400 dark:bg-blue-600'
              : 'bg-blue-600 dark:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800'
              }`}
          >
            <Text className="text-lg font-bold text-center text-white">
              {isSubmitting ? 'Saving...' : 'Log Activity'}
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
            <Text
              className={`text-center font-bold text-lg ${isSubmitting ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
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
