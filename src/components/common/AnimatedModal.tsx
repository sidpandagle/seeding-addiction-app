import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion, ANIMATION_PRESETS } from '../../hooks/useReducedMotion';
import { useColorScheme } from '../../stores/themeStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Called when modal should close (backdrop tap or close button) */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Presentation style - 'pageSheet' is iOS-like partial height, 'fullScreen' covers all */
  presentationStyle?: 'pageSheet' | 'fullScreen';
  /** Whether tapping backdrop closes modal */
  closeOnBackdropPress?: boolean;
  /** Custom background color for modal content */
  contentBackgroundColor?: string;
}

/**
 * AnimatedModal - Reusable modal wrapper with smooth animations
 * 
 * Features:
 * - Animated backdrop (fade in/out)
 * - Content slide up with spring physics
 * - Respects reduced motion preference
 * - Uses native Modal for proper gesture handling
 * - Keyboard avoiding behavior built-in
 * 
 * Usage:
 * ```tsx
 * <AnimatedModal visible={isOpen} onClose={() => setIsOpen(false)}>
 *   <YourModalContent />
 * </AnimatedModal>
 * ```
 */
export function AnimatedModal({
  visible,
  onClose,
  children,
  presentationStyle = 'pageSheet',
  closeOnBackdropPress = true,
  contentBackgroundColor,
}: AnimatedModalProps) {
  const reducedMotion = useReducedMotion();
  const colorScheme = useColorScheme();
  
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(SCREEN_HEIGHT);
  const contentOpacity = useSharedValue(0);

  // Default background color based on theme
  const defaultBgColor = colorScheme === 'dark' ? '#111827' : '#ffffff';
  const bgColor = contentBackgroundColor || defaultBgColor;

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        // Instant appearance for reduced motion
        backdropOpacity.value = 1;
        contentTranslateY.value = 0;
        contentOpacity.value = 1;
      } else {
        // Animated entrance
        backdropOpacity.value = withTiming(1, {
          duration: ANIMATION_PRESETS.modal.backdropDuration,
          easing: Easing.out(Easing.ease),
        });
        contentOpacity.value = withTiming(1, {
          duration: ANIMATION_PRESETS.modal.backdropDuration,
        });
        contentTranslateY.value = withSpring(0, {
          damping: ANIMATION_PRESETS.modal.springDamping,
          stiffness: ANIMATION_PRESETS.modal.springStiffness,
        });
      }
    }
  }, [visible, reducedMotion, backdropOpacity, contentTranslateY, contentOpacity]);

  // Handle close with animation
  const animateOut = useCallback(() => {
    if (reducedMotion) {
      // Instant dismissal for reduced motion
      onClose();
      return;
    }

    // Animated exit
    backdropOpacity.value = withTiming(0, {
      duration: ANIMATION_PRESETS.modal.backdropDuration,
      easing: Easing.in(Easing.ease),
    });
    contentOpacity.value = withTiming(0, {
      duration: ANIMATION_PRESETS.modal.backdropDuration,
    });
    contentTranslateY.value = withTiming(
      SCREEN_HEIGHT * 0.3,
      {
        duration: ANIMATION_PRESETS.modal.contentDuration,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  }, [reducedMotion, onClose, backdropOpacity, contentTranslateY, contentOpacity]);

  // Animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
    opacity: contentOpacity.value,
  }));

  // Reset animation values when modal closes
  const handleRequestClose = useCallback(() => {
    if (closeOnBackdropPress) {
      animateOut();
    }
  }, [closeOnBackdropPress, animateOut]);

  // Handle modal hidden - reset values for next open
  const handleModalHide = useCallback(() => {
    backdropOpacity.value = 0;
    contentTranslateY.value = SCREEN_HEIGHT;
    contentOpacity.value = 0;
  }, [backdropOpacity, contentTranslateY, contentOpacity]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // We handle animation ourselves
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      onDismiss={handleModalHide}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={closeOnBackdropPress ? animateOut : undefined}
          />
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            presentationStyle === 'pageSheet' && styles.pageSheetContent,
            presentationStyle === 'fullScreen' && styles.fullScreenContent,
            { backgroundColor: bgColor },
            contentAnimatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  pageSheetContent: {
    maxHeight: SCREEN_HEIGHT * 0.92,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  fullScreenContent: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

export default AnimatedModal;
