/**
 * BadgeCelebration Component
 *
 * Displays an animated celebration modal when user unlocks a badge
 * Replaces the simple Alert.alert with a more engaging visual experience
 */

import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn, ZoomOut, SlideInUp } from 'react-native-reanimated';
import { Badge } from '../../db/schema';
import * as Haptics from 'expo-haptics';
import AnimatedEmoji from '../common/AnimatedEmoji';

interface BadgeCelebrationProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export default function BadgeCelebration({
  badge,
  visible,
  onClose,
}: BadgeCelebrationProps) {

  // Badge celebration mounted - trigger haptic
  useEffect(() => {
    if (visible && badge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, badge]);

  if (!badge) return null;

  // Tier badge colors
  const getTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'silver':
        return 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300';
      case 'gold':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'platinum':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="items-center justify-center flex-1 bg-black/50">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />

        <Animated.View
          entering={ZoomIn.springify().damping(15).stiffness(200)}
          exiting={ZoomOut.duration(200)}
          className="mx-6"
        >
          <View className="p-8 bg-white rounded-3xl dark:bg-gray-800">
            {/* Content */}
            <View className="items-center">
              {/* Badge Unlocked Label */}
              <Text className="mb-4 text-sm font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
                🎉 Badge Unlocked 🎉
              </Text>

              {/* Badge with Animation */}
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(10)}
              >
                <View className="relative items-center justify-center">
                  {/* Glow Effect */}
                  {/* <View
                    className="absolute rounded-full bg-amber-500/20 dark:bg-amber-400/20"
                    style={{ width: 140, height: 140 }}
                  /> */}

                  {/* Badge Circle */}
                  <View
                    className="items-center justify-center bg-white rounded-full dark:bg-gray-800"
                    style={{ width: 120, height: 120 }}
                  >
                    <AnimatedEmoji
                      emoji={badge.emoji}
                      size={120}
                      behavior="loop"
                      accessibilityLabel={badge.title}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Badge Title */}
              <Animated.View entering={SlideInUp.delay(400).duration(400)}>
                <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
                  {badge.title}
                </Text>
              </Animated.View>

              {/* Badge Description */}
              <Animated.View entering={SlideInUp.delay(500).duration(400)}>
                <Text className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  {badge.description}
                </Text>
              </Animated.View>

              {/* Tier Badge (if present) */}
              {badge.tier && (
                <Animated.View
                  entering={ZoomIn.delay(600).duration(400)}
                  className="mt-4"
                >
                  <View className={`px-4 py-2 rounded-full ${getTierColor(badge.tier)}`}>
                    <Text className="text-xs font-bold tracking-wide uppercase">
                      ✨ {badge.tier} TIER
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Motivational Message */}
              <Animated.View
                entering={ZoomIn.delay(700).duration(400)}
                className="mt-6"
              >
                <View className="px-6 py-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <Text className="text-sm font-medium text-center text-amber-700 dark:text-amber-300">
                    Keep up the amazing work! 💪
                  </Text>
                </View>
              </Animated.View>

              {/* Close Button */}
              <Animated.View
                entering={FadeIn.delay(800).duration(400)}
                className="w-full mt-8"
              >
                <Pressable
                  onPress={onClose}
                  className="py-4 rounded-2xl active:opacity-80 bg-amber-200 dark:bg-amber-300"
                >
                  <Text className="text-lg font-semibold text-center text-amber-800">
                    🎊 Awesome!
                  </Text>
                </Pressable>
              </Animated.View>
            </View> 
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
