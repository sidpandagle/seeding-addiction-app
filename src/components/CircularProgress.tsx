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
  gradientColors?: string[]; // Array of colors for gradient (default: green to gold)
}

export default function CircularProgress({
  size = 120,
  strokeWidth = 8,
  progress,
  color = '#1B5E20', // Deep emerald green from theme
  backgroundColor = '#E0E0E0',
  showPercentage = false,
  children,
  checkpointLabel,
  showCheckpoint = false,
  useGradient = false,
  gradientColors = ['#1B5E20', '#A5D6A7', '#FFD54F'], // Green → Lime → Gold
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated value for smooth progress transitions
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  // Animate progress changes
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
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
          {/* Progress Circle */}
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
          />
        </Svg>

        {/* Center Content */}
        <View style={{ position: 'absolute' }} className="items-center justify-center">
          {children}
          {showPercentage && !children && (
            <Text className="text-2xl font-bold text-gray-900">
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
      </View>

      {/* Checkpoint Label */}
      {showCheckpoint && checkpointLabel && (
        <Text className="mt-3 text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 uppercase">
          {checkpointLabel}
        </Text>
      )}
    </View>
  );
}
