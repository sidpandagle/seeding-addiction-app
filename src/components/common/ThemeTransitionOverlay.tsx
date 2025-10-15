import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeStore } from '../../stores/themeStore';

/**
 * ThemeTransitionOverlay
 *
 * Provides a smooth full-screen fade overlay that masks the theme switching delay.
 * Creates an intentional, premium feel by covering re-render jank with elegant animation.
 *
 * Animation Flow:
 * 1. Theme change triggered → overlay fades in (150ms)
 * 2. Overlay stays visible (100ms) while components re-render
 * 3. Overlay fades out (150ms) → new theme fully applied
 * Total: ~400ms smooth transition (masks the 500-600ms re-render delay)
 */
export function ThemeTransitionOverlay() {
  const opacity = useSharedValue(0);
  const isTransitioning = useThemeStore((state) => state._isTransitioning);
  const setTransitioning = useThemeStore((state) => state.setTransitioning);
  const colorScheme = useThemeStore((state) => state.colorScheme);

  useEffect(() => {
    if (isTransitioning) {
      // Fade in → hold → fade out sequence
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }), // Fade in
        withTiming(1, { duration: 100 }), // Hold (while components re-render)
        withTiming(0, { duration: 150 }, (finished) => {
          // Animation complete - clear transitioning state
          if (finished) {
            runOnJS(setTransitioning)(false);
          }
        })
      );
    }
  }, [isTransitioning, opacity, setTransitioning]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Only render when transitioning (avoid reading .value during render)
  if (!isTransitioning) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        },
        animatedStyle,
      ]}
      pointerEvents="none" // Don't block touches
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Above everything
  },
});
