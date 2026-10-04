import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Achievement } from '../../utils/growthStages';
import { X } from 'lucide-react-native';
import AnimatedEmoji from '../common/AnimatedEmoji';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
  progress?: number; // 0-1 for badges close to unlock
  current?: number; // Current progress value
  required?: number; // Required value to unlock
}

export default function AchievementDetailModal({
  achievement,
  visible,
  onClose,
  progress,
  current,
  required,
}: Readonly<AchievementDetailModalProps>) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  if (!achievement) return null;

  // Generate dynamic message for near-completion achievements/badges
  const getMotivationalMessage = () => {
    if (achievement.isUnlocked) {
      return '🎉 Congratulations on this achievement! Keep up the amazing work!';
    }

    // Show dynamic message when progress > 70%
    if (progress && current !== undefined && required !== undefined && progress > 0.7) {
      const remaining = required - current;
      return `Almost there! Just ${remaining} more to unlock this badge!`;
    }

    // Default static message
    return '💪 Keep going! You\'re making progress toward unlocking this achievement.';
  };

  const motivationalMessage = getMotivationalMessage();

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
        <View className="w-full max-w-md overflow-hidden bg-surface shadow-2xl rounded-3xl">
          {/* Header */}
          <View className="relative">
            {achievement.isUnlocked ? (
              <View className="px-6 pt-8 pb-6 bg-primary">
                <Pressable
                  onPress={onClose}
                  className="absolute items-center justify-center w-10 h-10 rounded-full top-4 right-4 bg-primary-on/15 active:bg-primary-on/25"
                >
                  <X size={24} color={colors.onPrimary} />
                </Pressable>
                <View className="items-center">
                  <AnimatedEmoji
                    emoji={achievement.emoji}
                    size={80}
                    behavior="loop"
                    accessibilityLabel={achievement.title}
                  />
                  <Text className="mt-3 text-2xl font-bold text-center text-primary-on">
                    {achievement.title}
                  </Text>
                  <View className="px-3 py-1 mt-2 rounded-full bg-primary-on/15">
                    <Text className="text-sm font-semibold text-primary-on">Unlocked</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="px-6 pt-8 pb-6 bg-subtle">
                <Pressable
                  onPress={onClose}
                  className="absolute items-center justify-center w-10 h-10 rounded-full top-4 right-4 bg-fg/10 active:bg-fg/20"
                >
                  <X size={24} color={colors.fg} />
                </Pressable>
                <View className="items-center">
                  <View className="relative" style={{ opacity: 0.3 }}>
                    <AnimatedEmoji
                      emoji={achievement.emoji}
                      size={80}
                      behavior="static"
                      accessibilityLabel={`${achievement.title} (locked)`}
                    />
                    <View className="absolute top-0 right-0">
                      <Text style={{ fontSize: 40 }}>🔒</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-2xl font-bold text-center text-body">
                    {achievement.title}
                  </Text>
                  <View className="px-3 py-1 mt-2 bg-border-strong rounded-full">
                    <Text className="text-sm font-semibold text-body">Locked</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-6 max-h-80">
            {/* Requirement */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
                Requirement
              </Text>
              <Text className="font-regular text-base text-fg">
                {achievement.description}
              </Text>
            </View>

            {/* Requirement */}
            {/* <View className="mb-6">
              <Text className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
                Requirement
              </Text>
              <Text className="font-regular text-base text-fg">
                {achievement.threshold ? `Maintain a streak of ${achievement.shortLabel}` : 'Start your journey to unlock this achievement!'}
              </Text>
            </View> */}

            {/* Unlocked Date (if unlocked) */}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <View className="mb-6">
                <Text className="mb-2 text-sm font-medium tracking-wide text-muted uppercase">
                  Unlocked On
                </Text>
                <Text className="font-regular text-base text-fg">
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
                ? 'bg-primary-soft'
                : 'bg-subtle'
            }`}>
              <Text className={`font-regular text-sm text-center ${
                achievement.isUnlocked
                  ? 'text-primary-ink'
                  : 'text-body'
              }`}>
                {motivationalMessage}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={onClose}
              className={`w-full py-4 rounded-2xl ${
                achievement.isUnlocked
                  ? 'bg-primary active:bg-primary-ink'
                  : 'bg-muted active:bg-body'
              }`}
            >
              <Text className={`text-lg font-semibold text-center ${achievement.isUnlocked ? 'text-primary-on' : 'text-bg'}`}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
