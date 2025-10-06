import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from './AchievementBadge';
import { useThemeStore } from '../stores/themeStore';
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
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

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

        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
          }}
          className="mx-6"
        >
          <View
            className="p-8 rounded-3xl"
            style={{
              backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            }}
          >
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
              <Text
                className="mb-4 text-sm font-semibold tracking-widest uppercase"
                style={{ color: '#FFD700' }}
              >
                🎉 Achievement Unlocked 🎉
              </Text>

              {/* Badge with Sparkle Animation */}
              <MotiView
                from={{ scale: 0, rotate: '0deg' }}
                animate={{ scale: 1, rotate: '360deg' }}
                transition={{
                  type: 'spring',
                  damping: 10,
                  delay: 200,
                }}
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
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 120,
                      height: 120,
                      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                      borderWidth: 4,
                      borderColor: '#FFD700',
                    }}
                  >
                    <Text style={{ fontSize: 56 }}>{achievement.emoji}</Text>
                  </View>
                </View>
              </MotiView>

              {/* Achievement Title */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 400 }}
              >
                <Text
                  className="mt-6 text-2xl font-bold text-center"
                  style={{ color: isDark ? '#FFFFFF' : '#212121' }}
                >
                  {achievement.title}
                </Text>
              </MotiView>

              {/* Achievement Description */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 500 }}
              >
                <Text
                  className="mt-2 text-sm text-center"
                  style={{ color: isDark ? '#ABABAB' : '#757575' }}
                >
                  {achievement.description}
                </Text>
              </MotiView>

              {/* Motivational Message */}
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 600 }}
                className="mt-6"
              >
                <View
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: isDark ? '#1B5E20' : '#E8F5E9' }}
                >
                  <Text
                    className="text-sm font-medium text-center"
                    style={{ color: isDark ? '#A5D6A7' : '#2E7D32' }}
                  >
                    Keep growing! 🌱
                  </Text>
                </View>
              </MotiView>

              {/* Close Button */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 700 }}
                className="w-full mt-8"
              >
                <Pressable
                  onPress={onClose}
                  className="py-4 rounded-2xl active:opacity-80"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  <Text className="text-lg font-semibold text-center text-gray-900">
                    Continue
                  </Text>
                </Pressable>
              </MotiView>
            </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
