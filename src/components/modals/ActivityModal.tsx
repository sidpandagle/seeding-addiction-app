import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useActivityStore } from '../../stores/activityStore';
import { useColorScheme } from '../../stores/themeStore';
// Icon options for Activity Modal header (current: SmilePlus)
// Available alternatives: Sparkles, Heart, Award, Trophy, Star, Zap
import { SmilePlus, CheckCircle, Clock, Zap } from 'lucide-react-native';
import { getRandomTip, type EducationalTip } from '../../data/educationalContent';
import { ACTIVITY_CATEGORIES } from '../../constants/tags';
import { getCelebrationMessage, calculateCelebrationStats } from '../../utils/celebrationMessages';

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

  const [note, setNote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preSelectedCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityTip, setActivityTip] = useState<EducationalTip>(getRandomTip('activity'));
  const [duration, setDuration] = useState<number | null>(null);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [urgeIntensity, setUrgeIntensity] = useState<number | null>(null);
  const [reflectionPrompt] = useState(getRandomPrompt());

  // Calculate weekly activity count
  const getWeeklyActivityCount = (): number => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return activities.filter(a => new Date(a.timestamp) > weekAgo).length;
  };

  // Calculate days in a row
  const getDaysInARow = (): number => {
    if (activities.length === 0) return 0;

    const sortedActivities = [...activities].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let daysInARow = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const currentDate = new Date(sortedActivities[i].timestamp);
      const nextDate = new Date(sortedActivities[i + 1].timestamp);
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const dayDiff = (currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000);
      if (dayDiff === 1) {
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

  // Toggle category selection (multi-select)
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle duration button selection
  const handleDurationSelect = (minutes: number) => {
    setDuration(minutes);
    setShowCustomDuration(false);
  };

  // Handle custom duration confirmation
  const handleCustomDuration = () => {
    const mins = parseInt(customDurationInput, 10);
    if (!isNaN(mins) && mins > 0) {
      setDuration(mins);
      setShowCustomDuration(false);
      setCustomDurationInput('');
    }
  };

  // Handle urge intensity selection
  const handleUrgeIntensitySelect = (intensity: number | null) => {
    setUrgeIntensity(intensity);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Use custom duration if shown, otherwise use selected duration
      const finalDuration = showCustomDuration && customDurationInput ? parseInt(customDurationInput, 10) : duration;
      const timestamp = new Date().toISOString();

      await addActivity({
        timestamp,
        note: note.trim() || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        duration: finalDuration || undefined,
        urgeIntensity: urgeIntensity !== undefined ? urgeIntensity : undefined,
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
        Alert.alert(celebration.emoji, celebration.message, [
          {
            text: 'Amazing! 🎉',
            onPress: () => {
              setTimeout(() => {
                onClose();
              }, 100);
            },
          },
        ]);
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
                Water Your Plant 🌱
              </Text>
              <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                Track healthy actions
              </Text>
            </View>
            <View className="items-center justify-center w-16 h-16 bg-white rounded-2xl dark:bg-gray-900">
              <SmilePlus size={34} color="#3b82f6" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Activity Streak & Statistics Section */}
        <View className="px-5 mt-6">
          {/* Weekly Activity Count */}
          <View className="p-4 mb-3 border border-green-200 bg-green-50 dark:bg-green-950/30 rounded-xl dark:border-green-900/50">
            <Text className="mb-1 text-xs font-semibold text-green-600 uppercase dark:text-green-300">
              🌱 Your Growth This Week
            </Text>
            <Text className="text-2xl font-bold text-green-900 dark:text-green-100">
              {weeklyCount} watering{weeklyCount !== 1 ? 's' : ''}
            </Text>
            {daysInARow >= 3 && (
              <Text className="mt-1 text-sm text-green-800 dark:text-green-200">
                🔥 {daysInARow} days in a row!
              </Text>
            )}
          </View>

          {/* Most Common Activity */}
          {mostCommon && (
            <View className="p-3 mb-3 text-xs bg-purple-50 dark:bg-purple-950/30 rounded-xl">
              <Text className="text-xs text-purple-600 dark:text-purple-300">
                Most common: {mostCommon.category} ({mostCommon.count}x)
              </Text>
            </View>
          )}

          {/* Activity Tip Card */}
          {/* <View className="p-4 bg-blue-100 dark:bg-blue-800/30 rounded-xl">
            <Text className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-100">
              {activityTip.emoji} {activityTip.title}
            </Text>
            <Text className="text-sm leading-6 text-blue-800 dark:text-blue-200">
              {activityTip.content}
            </Text>
          </View> */}
        </View>

        {/* Content Card */}
        <View className="px-4 mt-2">
          <View className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
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

            {/* Duration Tracking */}
            <View className="mb-6">
              <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                ⏱️ How long did this take? (Optional)
              </Text>
              {!showCustomDuration ? (
                <>
                  <View className="flex-row gap-2 mb-2">
                    {[5, 15, 30, 60].map((minutes) => (
                      <Pressable
                        key={minutes}
                        onPress={() => handleDurationSelect(minutes)}
                        className={`flex-1 py-2 rounded-lg ${
                          duration === minutes
                            ? 'bg-blue-600 dark:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold text-center ${
                            duration === minutes
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {minutes}m
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => setShowCustomDuration(true)}
                    className="py-2 border border-gray-300 rounded-lg dark:border-gray-600"
                  >
                    <Text className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300">
                      Custom
                    </Text>
                  </Pressable>
                </>
              ) : (
                <View className="flex-row gap-2">
                  <TextInput
                    value={customDurationInput}
                    onChangeText={setCustomDurationInput}
                    placeholder="Minutes"
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    keyboardType="number-pad"
                    className="flex-1 p-2 text-gray-900 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                  <Pressable
                    onPress={handleCustomDuration}
                    className="px-4 py-2 bg-blue-600 rounded-lg dark:bg-blue-700"
                  >
                    <Text className="text-sm font-semibold text-white">Set</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowCustomDuration(false);
                      setCustomDurationInput('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                  >
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
                  </Pressable>
                </View>
              )}
              {duration && !showCustomDuration && (
                <Text className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Selected: {duration} minutes
                </Text>
              )}
            </View>

            {/* Urge Intensity Tracking */}
            <View className="mb-6">
              <Text className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                ⚡ Did this help fight an urge? (Optional)
              </Text>
              <View className="gap-2">
                <Pressable
                  onPress={() => handleUrgeIntensitySelect(null)}
                  className={`py-3 px-4 rounded-lg ${
                    urgeIntensity === null
                      ? 'bg-blue-600 dark:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urgeIntensity === null
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    No urge
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleUrgeIntensitySelect(2)}
                  className={`py-3 px-4 rounded-lg ${
                    urgeIntensity === 2
                      ? 'bg-yellow-500 dark:bg-yellow-600'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urgeIntensity === 2
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Low urge (1-3)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleUrgeIntensitySelect(5)}
                  className={`py-3 px-4 rounded-lg ${
                    urgeIntensity === 5
                      ? 'bg-orange-500 dark:bg-orange-600'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urgeIntensity === 5
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Medium urge (4-6)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleUrgeIntensitySelect(8)}
                  className={`py-3 px-4 rounded-lg ${
                    urgeIntensity === 8
                      ? 'bg-red-500 dark:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urgeIntensity === 8
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    High urge (7-10)
                  </Text>
                </Pressable>
              </View>
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
    </KeyboardAvoidingView>
  );
}
