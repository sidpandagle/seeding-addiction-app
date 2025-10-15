import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
  darkBackgroundColor?: string;
}

/**
 * Optimized screen wrapper without fade animations
 * Removes 200ms delay on screen mounting for instant navigation
 */
export function ScreenWrapper({
  children,
  backgroundColor = '#ffffff',
  darkBackgroundColor = '#111827',
  style,
  ...props
}: ScreenWrapperProps) {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? darkBackgroundColor : backgroundColor;

  return (
    <View
      style={[{ flex: 1, backgroundColor: bgColor }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
