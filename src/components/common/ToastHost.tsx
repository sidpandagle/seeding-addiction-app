import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useToastStore } from '../../stores/toastStore';
import { useReducedMotion, ANIMATION_PRESETS } from '../../hooks/useReducedMotion';

interface ToastHostProps {
  /** Distance from the bottom of the screen, so the toast clears the tab bar */
  bottomOffset: number;
}

/**
 * Renders the current toast. Mount once, above the tab navigator.
 */
export function ToastHost({ bottomOffset }: ToastHostProps) {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hideToast(toast.id), toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 px-4" style={{ bottom: bottomOffset }}>
      {toast && (
        <Animated.View
          key={toast.id}
          entering={reducedMotion ? undefined : FadeInDown.duration(ANIMATION_PRESETS.modal.backdropDuration)}
          exiting={reducedMotion ? undefined : FadeOutDown.duration(ANIMATION_PRESETS.modal.backdropDuration)}
          accessibilityLiveRegion="polite"
          className="flex-row items-center justify-between gap-3 px-4 py-3 bg-fg rounded-xl"
        >
          <Text className="flex-1 text-sm font-medium text-bg">{toast.message}</Text>
          {toast.action && (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                hideToast(toast.id);
              }}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="text-sm font-bold text-primary">{toast.action.label}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}
