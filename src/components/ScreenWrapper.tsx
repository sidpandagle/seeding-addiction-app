import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
  darkBackgroundColor?: string;
}

export function ScreenWrapper({
  children,
  backgroundColor = '#FDFCFB',
  darkBackgroundColor = '#1A1825',
  style,
  ...props
}: ScreenWrapperProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bgColor = colorScheme === 'dark' ? darkBackgroundColor : backgroundColor;

  return (
    <View
      style={[{ flex: 1, backgroundColor: bgColor }, style]}
      {...props}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}
