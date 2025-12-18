import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useActivityStore } from '../../stores/activityStore';
import { useColorScheme } from '../../stores/themeStore';
import { useCustomActivityTagsStore, formatActivityTag, SUGGESTED_EMOJIS, CustomActivityTag } from '../../stores/customActivityTagsStore';
import { Sprout, CheckCircle, Plus, X, Trash2 } from 'lucide-react-native';
import { getRandomTip, type EducationalTip } from '../../data/educationalContent';
import { ACTIVITY_CATEGORIES } from '../../constants/tags';
import { getCelebrationMessage, calculateCelebrationStats } from '../../utils/celebrationMessages';
import CustomAlert from '../common/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { getLocalDateString } from '../../utils/dateHelpers';

interface ActivityModalProps {
  onClose: () => void;
  preSelectedCategories?: string[]; // For Quick Actions integration
}

// Dynamic reflection prompts for note placeholder
const REFLECTION_PROMPTS = [
  'What action did you take to grow today?',
  'How did this activity make you stronger?',
  'What positive choice did you make?',
  'Describe how you\'re building momentum...',
  'How did this help you today?',
  'What did you accomplish?',
];

// Get random reflection prompt
const getRandomPrompt = (): string => {
  return REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
};

export default function ActivityModal({ onClose, preSelectedCategories = [] }: ActivityModalProps) {
  const { addActivity, activities } = useActivityStore();
  const colorScheme = useColorScheme();
  const { customTags, loadCustomTags, addCustomTag, removeCustomTag } = useCustomActivityTagsStore();

  const [note, setNote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preSelectedCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityTip, setActivityTip] = useState<EducationalTip>(getRandomTip('activity'));
  const [reflectionPrompt] = useState(getRandomPrompt());

  // Custom tag creation state
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');

  // Alert state
  const { alertState, showAlert, hideAlert } = useAlert();

  // Load custom tags on mount
  useEffect(() => {
    loadCustomTags();
  }, []);

  // Combine default and custom tags
  const customTagsFormatted = customTags.map(t => formatActivityTag(t));
  const allCategories = [...ACTIVITY_CATEGORIES, ...customTagsFormatted];

  // Calculate weekly activity count
  const getWeeklyActivityCount = (): number => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return activities.filter(a => new Date(a.timestamp) > weekAgo).length;
  };

  // Calculate days in a row using local date strings
  const getDaysInARow = (): number => {
    if (activities.length === 0) return 0;

    const sortedActivities = [...activities].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get local date strings for all activities
    const activityDates = sortedActivities.map(a =>
      getLocalDateString(a.timestamp)
    );

    let daysInARow = 1;
    const today = new Date();

    // Check consecutive days backwards from today
    for (let i = 1; i < activityDates.length + 1; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateStr = getLocalDateString(checkDate.toISOString());

      if (activityDates.includes(checkDateStr)) {
        daysInARow++;
      } else {
        break;
      }
    }

    return daysInARow;
  };

  // Get most common category
  const getMostCommonCategory = (): { category: string; count: number } | null => {
    if (activities.length === 0) return null;

    const categoryCounts: Record<string, number> = {};

    activities.forEach(activity => {
      if (activity.categories && activity.categories.length > 0) {
        activity.categories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    let mostCommon: { category: string; count: number } | null = null;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (!mostCommon || count > mostCommon.count) {
        mostCommon = { category: cat, count };
      }
    });

    return mostCommon;
  };

  const weeklyCount = getWeeklyActivityCount();
  const daysInARow = getDaysInARow();
  const mostCommon = getMostCommonCategory();

  // Check if a category is a custom tag
  const isCustomTag = (category: string): boolean => {
    return customTagsFormatted.includes(category);
  };

  // Get custom tag object from formatted string
  const getCustomTagFromFormatted = (formatted: string): CustomActivityTag | undefined => {
    return customTags.find(t => formatActivityTag(t) === formatted);
  };

  // Toggle category selection (multi-select, max 5)
  const toggleCategory = async (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Deselect if already selected
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev.filter((c) => c !== category);
      } else if (prev.length < 5) {
        // Select if under limit
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return [...prev, category];
      } else {
        // At limit, show error haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return prev;
      }
    });
  };

  // Handle adding a new custom tag
  const handleAddCustomTag = async () => {
    const success = await addCustomTag(selectedEmoji, newTagLabel);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewTagLabel('');
      setSelectedEmoji('✨');
      setShowAddTag(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        type: 'error',
        title: 'Cannot Add Tag',
        message: customTags.length >= 10
          ? 'Maximum 10 custom tags allowed.'
          : 'A tag with this name already exists.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  // Handle removing a custom tag
  const handleRemoveCustomTag = async (formatted: string) => {
    const tag = getCustomTagFromFormatted(formatted);
    if (tag) {
      await removeCustomTag(tag.id);
      // Also remove from selected if it was selected
      setSelectedCategories(prev => prev.filter(c => c !== formatted));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      const timestamp = new Date().toISOString();

      await addActivity({
        timestamp,
        note: note.trim() || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });

      // Calculate celebration stats
      const stats = calculateCelebrationStats(activities, timestamp);
      const celebration = getCelebrationMessage(
        stats.totalActivitiesThisMonth,
        stats.totalActivitiesThisWeek,
        stats.daysInARow,
        stats.isFirstActivity
      );

      // Show celebration if there's a milestone
      if (celebration) {
        showAlert({
          type: 'success',
          title: 'Great Progress!',
          message: celebration.message,
          buttons: [{
            text: 'Amazing!',
            onPress: () => {
              hideAlert();
              setTimeout(() => {
                onClose();
              }, 100);
            },
          }],
        });
      } else {
        // Brief delay for feedback
        setTimeout(() => {
          onClose();
        }, 300);
      }
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
                Water Your Plant
              </Text>
              <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                Track healthy actions
              </Text>
            </View>
            <View className="items-center justify-center w-16 h-16 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <Sprout size={34} color="#10b981" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Activity Streak & Statistics Section */}
        <View className="px-5 mt-2">
          <View className="flex-row gap-3">
            {/* Weekly Activity Count */}
            <View className="flex-1 p-4 border border-green-200 bg-green-50 dark:bg-green-950/30 rounded-xl dark:border-green-900/50">
              <Text className="mb-1 text-xs font-semibold text-green-600 uppercase dark:text-green-300">
                Your Growth This Week
              </Text>
              <Text className="text-2xl font-bold text-green-900 dark:text-green-100">
                {weeklyCount} watering{weeklyCount !== 1 ? 's' : ''}
              </Text>
              {daysInARow >= 3 && (
                <Text className="mt-1 text-sm text-green-800 dark:text-green-200">
                  {daysInARow} days in a row!
                </Text>
              )}
            </View>

            {/* Most Common Activity */}
            <View className="flex-1 p-4 border border-purple-200 bg-purple-50 dark:bg-purple-950/30 rounded-xl dark:border-purple-900/50">
              <Text className="mb-1 text-xs font-semibold text-purple-600 uppercase dark:text-purple-300">
                Most Common
              </Text>
              {mostCommon ? (
                <>
                  <Text className="text-lg font-bold text-purple-900 dark:text-purple-100" numberOfLines={1}>
                    {mostCommon.category}
                  </Text>
                  <Text className="mt-1 text-sm text-purple-700 dark:text-purple-200">
                    {mostCommon.count}x logged
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-purple-600 dark:text-purple-300">
                  Start tracking!
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Content Card */}
        <View className="px-4 mt-4">
          <View className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            {/* Note Input */}
            <View className="mb-6">
              <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Reflection (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={reflectionPrompt}
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
                  Activity Type (Max 5)
                </Text>
                <View className={`px-2 py-1 rounded-full ${
                  selectedCategories.length >= 5
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-blue-100 dark:bg-blue-600/30'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    selectedCategories.length >= 5
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {selectedCategories.length}/5 selected
                  </Text>
                </View>
              </View>

              {/* Badge Layout - Free flowing */}
              <View className="flex-row flex-wrap gap-2">
                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const isCustom = isCustomTag(category);
                  const isDisabled = !isSelected && selectedCategories.length >= 5;

                  return (
                    <Pressable
                      key={category}
                      onPress={() => toggleCategory(category)}
                      onLongPress={isCustom ? () => handleRemoveCustomTag(category) : undefined}
                      disabled={isDisabled}
                      className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 dark:bg-blue-800/30'
                          : isDisabled
                          ? 'bg-gray-100/50 dark:bg-gray-800/50 opacity-50'
                          : isCustom
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected
                            ? 'text-white'
                            : isDisabled
                            ? 'text-gray-400 dark:text-gray-600'
                            : isCustom
                            ? 'text-purple-700 dark:text-purple-300'
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

                {/* Add Custom Tag Button */}
                <Pressable
                  onPress={() => setShowAddTag(true)}
                  className="px-4 py-2.5 rounded-full flex-row items-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600"
                >
                  <Plus size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} strokeWidth={2.5} />
                  <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Add Tag
                  </Text>
                </Pressable>
              </View>

              {/* Hint for custom tags */}
              {customTags.length > 0 && (
                <Text className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Long press custom tags to remove them
                </Text>
              )}
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
              {isSubmitting ? 'Saving...' : 'Water Your Plant'}
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

      {/* Add Custom Tag Modal */}
      <Modal
        visible={showAddTag}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddTag(false)}
      >
        <Pressable
          onPress={() => setShowAddTag(false)}
          className="items-center justify-center flex-1 px-6 bg-black/50"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Add Custom Activity
              </Text>
              <Pressable
                onPress={() => setShowAddTag(false)}
                className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full dark:bg-gray-800"
              >
                <X size={18} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            {/* Emoji Selection */}
            <View className="px-5 pb-4">
              <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                Choose an Emoji
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {SUGGESTED_EMOJIS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => {
                        setSelectedEmoji(emoji);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className={`w-10 h-10 items-center justify-center rounded-xl ${
                        selectedEmoji === emoji
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Text className="text-xl">{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Tag Name Input */}
            <View className="px-5 pb-4">
              <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                Activity Name
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <View className="px-3">
                  <Text className="text-xl">{selectedEmoji}</Text>
                </View>
                <TextInput
                  value={newTagLabel}
                  onChangeText={setNewTagLabel}
                  placeholder="e.g., Journaling"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  className="flex-1 py-3 pr-4 text-base font-medium text-gray-900 dark:text-white"
                  maxLength={20}
                  autoFocus
                  onSubmitEditing={handleAddCustomTag}
                />
              </View>
            </View>

            {/* Preview */}
            <View className="px-5 pb-4">
              <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                Preview
              </Text>
              <View className="self-start px-4 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Text className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {selectedEmoji} {newTagLabel || 'Your Activity'}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="gap-2 px-5 pb-5">
              <Pressable
                onPress={handleAddCustomTag}
                disabled={!newTagLabel.trim()}
                className={`py-3 rounded-xl ${
                  newTagLabel.trim()
                    ? 'bg-blue-600 active:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-center font-bold ${
                  newTagLabel.trim() ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Add Activity
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Alert */}
      {alertState && (
        <CustomAlert
          visible={alertState.visible}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onDismiss={hideAlert}
          dismissOnBackdrop={alertState.dismissOnBackdrop}
        />
      )}
    </KeyboardAvoidingView>
  );
}
