import { Modal, View, Text, Pressable } from 'react-native';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Badge } from '../../db/schema';
import { useColorScheme } from '../../stores/themeStore';
import { Award } from 'lucide-react-native';

interface BadgeCelebrationProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeCelebration({
  visible,
  badge,
  onClose,
}: BadgeCelebrationProps) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (visible && badge) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible, badge]);

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="items-center justify-center flex-1 px-6 bg-black/70">
        <View className="w-full max-w-md overflow-hidden bg-white dark:bg-gray-900 rounded-3xl">
          {/* Celebration Header */}
          <View className="items-center px-6 pt-8 pb-6 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-900">
            <View className="items-center justify-center w-20 h-20 mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Award size={40} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Badge Unlocked!
            </Text>
            <Text className="mt-1 text-sm font-medium text-center text-gray-600 dark:text-gray-400">
              Congratulations on your achievement
            </Text>
          </View>

          {/* Badge Display */}
          <View className="items-center px-6 py-8">
            <Text className="mb-4 text-7xl">{badge.emoji}</Text>
            <Text className="text-xl font-bold text-center text-gray-900 dark:text-white">
              {badge.title}
            </Text>
            <Text className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {badge.description}
            </Text>

            {/* Tier Badge */}
            {badge.tier && (
              <View className="px-4 py-1.5 mt-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Text className="text-sm font-bold text-blue-700 uppercase dark:text-blue-400">
                  {badge.tier}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={onClose}
              className="items-center justify-center px-6 py-4 bg-blue-600 dark:bg-blue-700 rounded-2xl active:bg-blue-700 dark:active:bg-blue-800"
            >
              <Text className="text-base font-bold text-white">
                Yay!! 🎉
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
