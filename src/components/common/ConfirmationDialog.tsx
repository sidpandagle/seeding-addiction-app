import { View, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';

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
  const colors = useThemeColors();
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
      if (__DEV__) console.error('Confirmation action failed:', error);
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
        <View className="w-full max-w-[340px] bg-surface rounded-2xl overflow-hidden">
          {/* Icon Circle */}
          <View className="items-center pt-8 pb-4">
            <View className="w-16 h-16 rounded-full bg-urge-soft items-center justify-center">
              <AlertTriangle size={32} color={colors.urge} strokeWidth={2.5} />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            {/* Title */}
            <Text className={`text-xl font-bold text-center mb-3 ${
              isDestructive
                ? 'text-urge'
                : 'text-fg'
            }`}>
              {title}
            </Text>

            {/* Message */}
            <Text className="text-base text-center text-muted mb-6 font-regular">
              {message}
            </Text>

            {/* Two-column buttons */}
            <View className="flex-row gap-3">
              {/* Cancel Button */}
              <Pressable
                onPress={handleCancel}
                disabled={isLoading}
                className={`flex-1 rounded-2xl py-3.5 bg-surface border border-border ${
                  isLoading
                    ? 'opacity-50'
                    : 'active:bg-bg'
                }`}
              >
                <Text className="text-center text-base font-bold text-body">
                  {cancelText}
                </Text>
              </Pressable>

              {/* Confirm Button */}
              <Pressable
                onPress={handleConfirm}
                disabled={isLoading}
                className={`flex-1 rounded-2xl py-3.5 ${
                  isLoading
                    ? 'bg-urge'
                    : isDestructive
                    ? 'bg-urge active:bg-urge/85'
                    : 'bg-primary active:bg-primary-ink'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text className="text-base font-bold text-center text-primary-on">
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
