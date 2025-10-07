import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn, ZoomOut, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from './AchievementBadge';
import * as Haptics from 'expo-haptics';

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

export default function AchievementCelebration({
  achievement,
  visible,
  onClose,
}: AchievementCelebrationProps) {

  // Trigger haptic feedback when achievement appears
  useEffect(() => {
    if (visible && achievement) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, achievement]);

  if (!achievement) return null;

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
            {/* Confetti Effect Background */}
            <View className="absolute inset-0 overflow-hidden rounded-3xl">
              <LinearGradient
                colors={['#FFD700', '#FFA500', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  opacity: 0.1,
                }}
              />
            </View>

            {/* Content */}
            <View className="items-center">
              {/* Achievement Unlocked Label */}
              <Text className="mb-4 text-sm font-semibold tracking-widest uppercase text-yellow-500">
                🎉 Achievement Unlocked 🎉
              </Text>

              {/* Badge with Sparkle Animation */}
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(10)}
              >
                <View className="relative items-center justify-center">
                  {/* Glow Effect */}
                  <View className="absolute" style={{ width: 140, height: 140 }}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500', 'transparent']}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 70,
                        opacity: 0.4,
                      }}
                    />
                  </View>

                  {/* Badge Circle */}
                  <View
                    className="items-center justify-center bg-white rounded-full border-4 border-yellow-500 dark:bg-gray-800"
                    style={{ width: 120, height: 120 }}
                  >
                    <Text style={{ fontSize: 56 }}>{achievement.emoji}</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Achievement Title */}
              <Animated.View entering={SlideInUp.delay(400).duration(400)}>
                <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
                  {achievement.title}
                </Text>
              </Animated.View>

              {/* Achievement Description */}
              <Animated.View entering={SlideInUp.delay(500).duration(400)}>
                <Text className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </Text>
              </Animated.View>

              {/* Motivational Message */}
              <Animated.View
                entering={ZoomIn.delay(600).duration(400)}
                className="mt-6"
              >
                <View className="px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                  <Text className="text-sm font-medium text-center text-emerald-700 dark:text-emerald-300">
                    Keep growing! 🌱
                  </Text>
                </View>
              </Animated.View>

              {/* Close Button */}
              <Animated.View
                entering={FadeIn.delay(700).duration(400)}
                className="w-full mt-8"
              >
                <Pressable
                  onPress={onClose}
                  className="py-4 rounded-2xl active:opacity-80 bg-yellow-500"
                >
                  <Text className="text-lg font-semibold text-center text-gray-900">
                    Continue
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
