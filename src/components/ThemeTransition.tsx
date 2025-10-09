import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

export function ThemeTransition({ children }: ThemeTransitionProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Smooth fade transition without bounce/scale
    opacity.value = withSequence(
      withTiming(0.85, {
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );
  }, [colorScheme]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
