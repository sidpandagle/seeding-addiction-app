import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn, ZoomOut, SlideInUp } from 'react-native-reanimated';
import { Achievement } from '../../utils/growthStages';
import AnimatedEmoji from '../common/AnimatedEmoji';

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
  /** Replaces the default "Keep growing!" line, e.g. when returning to a stage reached before */
  note?: string;
}

export default function AchievementCelebration({
  achievement,
  visible,
  onClose,
  note,
}: AchievementCelebrationProps) {

  // Achievement celebration mounted
  useEffect(() => {
    // Removed haptic feedback
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
          <View className="p-8 bg-surface rounded-3xl">
            {/* Content */}
            <View className="items-center">
              {/* Achievement Unlocked Label */}
              <Text className="mb-4 text-sm font-semibold tracking-wide uppercase text-primary">
                🎉 Achievement Unlocked 🎉
              </Text>

              {/* Badge with Sparkle Animation */}
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(10)}
              >
                <View className="relative items-center justify-center">
                  {/* Glow Effect */}
                  {/* <View
                    className="absolute rounded-full bg-primary/20"
                    style={{ width: 140, height: 140 }}
                  /> */}

                  {/* Badge Circle */}
                  <View
                    className="items-center justify-center bg-surface rounded-full"
                    style={{ width: 120, height: 120 }}
                  >
                    <AnimatedEmoji
                      emoji={achievement.emoji}
                      size={120}
                      behavior="loop"
                      accessibilityLabel={achievement.title}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Achievement Title */}
              <Animated.View entering={SlideInUp.delay(400).duration(400)}>
                <Text className="mt-6 text-2xl font-bold text-center text-fg">
                  {achievement.title}
                </Text>
              </Animated.View>

              {/* Achievement Description */}
              <Animated.View entering={SlideInUp.delay(500).duration(400)}>
                <Text className="font-regular mt-2 text-sm text-center text-muted">
                  {achievement.description}
                </Text>
              </Animated.View>

              {/* Motivational Message */}
              <Animated.View
                entering={ZoomIn.delay(600).duration(400)}
                className="mt-6"
              >
                <View className="px-6 py-3 rounded-full bg-primary-soft">
                  <Text className="text-sm font-medium text-center text-primary-ink">
                    {note ?? 'Keep growing! 🌱'}
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
                  className="py-4 rounded-2xl active:opacity-80 bg-primary"
                >
                  <Text className="text-lg font-semibold text-center text-primary-on">
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
