import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '../../stores/themeStore';
import { Achievement } from './AchievementBadge';
import { X } from 'lucide-react-native';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

export default function AchievementDetailModal({
  achievement,
  visible,
  onClose,
}: AchievementDetailModalProps) {
  const colorScheme = useColorScheme();

  if (!achievement) return null;

  const formatThreshold = (threshold: number) => {
    const minutes = threshold / (1000 * 60);
    const hours = threshold / (1000 * 60 * 60);
    const days = threshold / (1000 * 60 * 60 * 24);

    if (days === 0) {
      return 'the start of your journey';
    } else if (minutes < 60) {
      return minutes === 1 ? '1 minute' : `${Math.floor(minutes)} minutes`;
    } else if (hours < 24) {
      return hours === 1 ? '1 hour' : `${Math.floor(hours)} hours`;
    } else if (days === 1) {
      return '1 day';
    } else {
      return `${Math.floor(days)} days`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View className="w-full max-w-md overflow-hidden bg-white shadow-2xl dark:bg-gray-800 rounded-3xl">
          {/* Header */}
          <View className="relative">
            {achievement.isUnlocked ? (
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 pt-8 pb-6"
              >
                <Pressable
                  onPress={onClose}
                  className="absolute items-center justify-center w-10 h-10 rounded-full top-4 right-4 bg-black/10 active:bg-black/20"
                >
                  <X size={24} color="#FFFFFF" />
                </Pressable>
                <View className="items-center">
                  <Text style={{ fontSize: 80 }}>{achievement.emoji}</Text>
                  <Text className="mt-3 text-2xl font-bold text-center text-white">
                    {achievement.title}
                  </Text>
                  <View className="px-3 py-1 mt-2 rounded-full bg-white/20">
                    <Text className="text-sm font-semibold text-white">Unlocked</Text>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <View className="px-6 pt-8 pb-6 bg-gray-100 dark:bg-gray-700">
                <Pressable
                  onPress={onClose}
                  className="absolute items-center justify-center w-10 h-10 rounded-full top-4 right-4 bg-black/10 dark:bg-white/10 active:bg-black/20 dark:active:bg-white/20"
                >
                  <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
                </Pressable>
                <View className="items-center">
                  <View className="relative">
                    <Text style={{ fontSize: 80, opacity: 0.3 }}>{achievement.emoji}</Text>
                    <View className="absolute top-0 right-0">
                      <Text style={{ fontSize: 40 }}>🔒</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-2xl font-bold text-center text-gray-600 dark:text-gray-300">
                    {achievement.title}
                  </Text>
                  <View className="px-3 py-1 mt-2 bg-gray-300 rounded-full dark:bg-gray-600">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Locked</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-6 max-h-80">
            {/* Description */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Description
              </Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {achievement.description}
              </Text>
            </View>

            {/* Requirement */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Requirement
              </Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {achievement.threshold ? `Maintain a streak of ${achievement.shortLabel}` : 'Start your journey to unlock this achievement!'}
              </Text>
            </View>

            {/* Unlocked Date (if unlocked) */}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Unlocked On
                </Text>
                <Text className="text-base text-gray-900 dark:text-white">
                  {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}

            {/* Motivational Message */}
            <View className={`p-4 rounded-xl ${
              achievement.isUnlocked
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Text className={`text-sm text-center ${
                achievement.isUnlocked
                  ? 'text-yellow-900 dark:text-yellow-200'
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {achievement.isUnlocked
                  ? '🎉 Congratulations on this achievement! Keep up the amazing work!'
                  : '💪 Keep going! You\'re making progress toward unlocking this achievement.'}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={onClose}
              className={`w-full py-4 rounded-2xl ${
                achievement.isUnlocked
                  ? 'bg-yellow-500 active:bg-yellow-600'
                  : 'bg-gray-600 dark:bg-gray-700 active:bg-gray-700 dark:active:bg-gray-800'
              }`}
            >
              <Text className="text-lg font-semibold text-center text-white">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
