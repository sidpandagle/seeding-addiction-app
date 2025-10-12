import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
  checkpointLabel?: string; // e.g., "Next: 1 day"
  showCheckpoint?: boolean;
  useGradient?: boolean; // Enable gradient mode
  gradientColors?: string[]; // Array of colors for gradient
}

export default function CircularProgress({
  size = 120,
  strokeWidth = 8,
  progress,
  color = '#6B9A7F', // Soft sage from new theme
  backgroundColor = '#F5F5F5',
  showPercentage = false,
  children,
  checkpointLabel,
  showCheckpoint = false,
  useGradient = false,
  gradientColors = ['#6B9A7F', '#8FB79C'], // Soft sage gradient
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated value for smooth progress transitions
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  // Animate progress changes with gentle easing
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 600, // Slightly slower for calmer feel
      useNativeDriver: true,
    }).start();
  }, [progress, animatedProgress]);

  // Interpolate animated progress to strokeDashoffset
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Generate gradient ID once per component instance (memoized to prevent re-generation)
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Define Gradient */}
          {useGradient && (
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                {gradientColors.map((gradColor, index) => (
                  <Stop
                    key={index}
                    offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                    stopColor={gradColor}
                    stopOpacity="1"
                  />
                ))}
              </LinearGradient>
            </Defs>
          )}

          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle - Softer appearance */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={useGradient ? `url(#${gradientId})` : color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity={0.95}
          />
        </Svg>

        {/* Center Content */}
        <View style={{ position: 'absolute' }} className="items-center justify-center">
          {children}
          {showPercentage && !children && (
            <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
      </View>

      {/* Checkpoint Label */}
      {showCheckpoint && checkpointLabel && (
        <Text className="mt-6 px-4 text-xs text-center text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {checkpointLabel}
        </Text>
      )}
    </View>
  );
}
