import { View, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../../stores/themeStore';

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmationDialogProps) {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  // Trigger haptic feedback when dialog appears
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible]);

  const handleConfirm = async () => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await onConfirm();
      // Don't need to set loading false because component will unmount
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      onCancel();
    }, 50);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-[340px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          {/* Icon Circle */}
          <View className="items-center pt-8 pb-4">
            <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
              <AlertTriangle size={32} color="#ef4444" strokeWidth={2.5} />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            {/* Title */}
            <Text className={`text-xl font-bold text-center mb-3 ${
              isDestructive
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {title}
            </Text>

            {/* Message */}
            <Text className="text-base text-center text-gray-600 dark:text-gray-400 mb-6 font-regular">
              {message}
            </Text>

            {/* Two-column buttons */}
            <View className="flex-row gap-3">
              {/* Cancel Button */}
              <Pressable
                onPress={handleCancel}
                disabled={isLoading}
                className={`flex-1 rounded-2xl py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
                  isLoading
                    ? 'opacity-50'
                    : 'active:bg-gray-50 dark:active:bg-gray-700'
                }`}
              >
                <Text className="text-center text-base font-bold text-gray-700 dark:text-gray-300">
                  {cancelText}
                </Text>
              </Pressable>

              {/* Confirm Button */}
              <Pressable
                onPress={handleConfirm}
                disabled={isLoading}
                className={`flex-1 rounded-2xl py-3.5 ${
                  isLoading
                    ? 'bg-red-400 dark:bg-red-600'
                    : isDestructive
                    ? 'bg-red-600 dark:bg-red-700 active:bg-red-700 dark:active:bg-red-800'
                    : 'bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-center text-base font-bold text-white">
                    {confirmText}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
