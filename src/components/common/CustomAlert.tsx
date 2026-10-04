import { View, Text, Modal, Pressable } from 'react-native';
import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { TokenName } from '../../constants/palette';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

export interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  dismissOnBackdrop?: boolean;
}

interface AlertConfig {
  icon: React.ComponentType<any>;
  iconColor: TokenName;
  iconBg: string;
}

const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  success: {
    icon: CheckCircle,
    iconColor: 'primary',
    iconBg: 'bg-primary-soft',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'urge',
    iconBg: 'bg-urge-soft',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'gold',
    iconBg: 'bg-gold-soft',
  },
  info: {
    icon: Info,
    iconColor: 'info',
    iconBg: 'bg-info-soft',
  },
};

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  buttons = [],
  onDismiss,
  dismissOnBackdrop = false,
}: CustomAlertProps) {
  const colors = useThemeColors();
  const config = ALERT_CONFIGS[type];
  const Icon = config.icon;

  // Trigger haptic feedback when alert appears
  useEffect(() => {
    if (visible) {
      if (type === 'info') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        const feedbackType =
          type === 'success' ? Haptics.NotificationFeedbackType.Success :
          type === 'error' ? Haptics.NotificationFeedbackType.Error :
          Haptics.NotificationFeedbackType.Warning;
        Haptics.notificationAsync(feedbackType);
      }
    }
  }, [visible, type]);

  // Handle button press with haptic feedback
  const handleButtonPress = async (button: AlertButton) => {
    const hapticStyle =
      button.style === 'destructive' ? Haptics.ImpactFeedbackStyle.Heavy :
      button.style === 'cancel' ? Haptics.ImpactFeedbackStyle.Light :
      Haptics.ImpactFeedbackStyle.Medium;

    await Haptics.impactAsync(hapticStyle);

    // Small delay for haptic to register
    setTimeout(() => {
      button.onPress?.();
    }, 50);
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (dismissOnBackdrop && onDismiss) {
      onDismiss();
    }
  };

  // Default button if none provided
  const finalButtons = buttons.length > 0
    ? buttons
    : [{ text: 'OK', onPress: onDismiss, style: 'default' as const }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        onPress={handleBackdropPress}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[340px] bg-surface rounded-2xl overflow-hidden"
        >
          {/* Icon Circle */}
          <View className="items-center pt-8 pb-4">
            <View className={`w-16 h-16 rounded-full ${config.iconBg} items-center justify-center`}>
              <Icon size={32} color={colors[config.iconColor]} strokeWidth={2.5} />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            {/* Title */}
            <Text className="text-xl font-bold text-center mb-3 text-fg">
              {title}
            </Text>

            {/* Message */}
            <Text className="text-base text-center text-muted mb-6 font-regular">
              {message}
            </Text>

            {/* Buttons */}
            <View className="gap-3">
              {finalButtons.map((button, index) => (
                <AlertButton
                  key={index}
                  button={button}
                  onPress={() => handleButtonPress(button)}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Button component
function AlertButton({
  button,
  onPress
}: {
  button: AlertButton;
  onPress: () => void;
}) {
  const getButtonStyles = () => {
    switch (button.style) {
      case 'destructive':
        return 'bg-urge active:bg-urge/85';
      case 'cancel':
        return 'bg-surface border border-border active:bg-bg';
      default:
        return 'bg-primary active:bg-primary-ink';
    }
  };

  const getTextStyles = () => {
    return button.style === 'cancel'
      ? 'text-body'
      : 'text-primary-on';
  };

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl py-3.5 ${getButtonStyles()}`}
    >
      <Text className={`text-center text-base font-bold ${getTextStyles()}`}>
        {button.text}
      </Text>
    </Pressable>
  );
}
