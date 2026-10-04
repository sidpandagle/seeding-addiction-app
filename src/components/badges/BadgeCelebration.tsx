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
        return 'bg-gold-soft text-gold-ink';
      case 'silver':
        return 'bg-subtle text-body';
      case 'gold':
        return 'bg-gold-soft text-gold-ink';
      case 'platinum':
        return 'bg-plum-soft text-plum';
      default:
        return 'bg-primary-soft text-primary-ink';
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
          <View className="p-8 bg-surface rounded-3xl">
            {/* Content */}
            <View className="items-center">
              {/* Badge Unlocked Label */}
              <Text className="mb-4 text-sm font-semibold tracking-wide uppercase text-gold-ink">
                🎉 Badge Unlocked 🎉
              </Text>

              {/* Badge with Animation */}
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(10)}
              >
                <View className="relative items-center justify-center">
                  {/* Glow Effect */}
                  {/* <View
                    className="absolute rounded-full bg-gold/20"
                    style={{ width: 140, height: 140 }}
                  /> */}

                  {/* Badge Circle */}
                  <View
                    className="items-center justify-center bg-surface rounded-full"
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
                <Text className="mt-6 text-2xl font-bold text-center text-fg">
                  {badge.title}
                </Text>
              </Animated.View>

              {/* Badge Description */}
              <Animated.View entering={SlideInUp.delay(500).duration(400)}>
                <Text className="font-regular mt-2 text-sm text-center text-muted">
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
                <View className="px-6 py-3 rounded-full bg-gold-soft">
                  <Text className="text-sm font-medium text-center text-gold-ink">
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
                  className="py-4 rounded-2xl active:opacity-80 bg-gold/25"
                >
                  <Text className="text-lg font-semibold text-center text-gold-ink">
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
