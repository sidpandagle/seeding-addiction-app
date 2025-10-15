import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getCheckpointProgress } from '../../utils/checkpointHelpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0 to 1 (optional if using live mode)
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
  checkpointLabel?: React.ReactNode; // e.g., "Next: 1 day" or a component
  showCheckpoint?: boolean;
  useGradient?: boolean; // Enable gradient mode
  gradientColors?: string[]; // Array of colors for gradient (default: green to gold)
  // Live progress mode (calculates progress internally)
  startTime?: string; // ISO timestamp - when the current streak started
  currentCheckpointDuration?: number; // Milliseconds of current checkpoint (start of range)
  nextCheckpointDuration?: number; // Milliseconds to next checkpoint (end of range)
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
  startTime,
  currentCheckpointDuration,
  nextCheckpointDuration,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Live progress mode: calculate progress internally based on elapsed time
  const [liveProgress, setLiveProgress] = useState(0);
  const [internalCurrentCheckpoint, setInternalCurrentCheckpoint] = useState<number | undefined>(currentCheckpointDuration);
  const [internalNextCheckpoint, setInternalNextCheckpoint] = useState<number | undefined>(nextCheckpointDuration);

  // Use live progress if startTime and checkpoint durations are provided, otherwise use prop
  const currentProgress = startTime && nextCheckpointDuration !== undefined ? liveProgress : (progress ?? 0);

  // Animated value for smooth progress transitions
  const animatedProgress = useRef(new Animated.Value(currentProgress)).current;
  const previousProgress = useRef(currentProgress);

  // Track previous checkpoint to detect when we cross a milestone
  const previousCheckpointRef = useRef<number | undefined>(internalCurrentCheckpoint);

  // Reset animation when checkpoint changes (milestone reached)
  // This must run BEFORE the live progress update effect
  useEffect(() => {
    if (previousCheckpointRef.current !== undefined && 
        previousCheckpointRef.current !== internalCurrentCheckpoint) {
      // Checkpoint changed - reset everything to start fresh
      setLiveProgress(0);
      animatedProgress.setValue(0);
      previousProgress.current = 0;
      console.log('🔄 Checkpoint changed! Resetting progress bar from', previousCheckpointRef.current, 'to', internalCurrentCheckpoint);
    }
    previousCheckpointRef.current = internalCurrentCheckpoint;
  }, [internalCurrentCheckpoint, animatedProgress]);

  // Live progress mode: update every second when startTime is provided
  useEffect(() => {
    if (!startTime) return;

    const updateProgress = () => {
      const elapsed = Math.max(0, Date.now() - new Date(startTime).getTime());

      // Recalculate checkpoint progress internally to detect milestone crossings
      const checkpointProgress = getCheckpointProgress(elapsed);
      
      // Update internal checkpoint values
      const newCurrentDuration = checkpointProgress.currentCheckpoint?.duration;
      const newNextDuration = checkpointProgress.nextCheckpoint?.duration;
      
      setInternalCurrentCheckpoint(newCurrentDuration);
      setInternalNextCheckpoint(newNextDuration);

      // If all checkpoints completed, show 100%
      if (checkpointProgress.isCompleted) {
        setLiveProgress(1);
        return;
      }

      // Calculate progress between current checkpoint and next checkpoint
      if (newNextDuration !== undefined) {
        const startDuration = newCurrentDuration ?? 0;
        const endDuration = newNextDuration;
        const timeInCurrentRange = elapsed - startDuration;
        const totalRangeTime = endDuration - startDuration;

        const calculatedProgress = Math.min(Math.max(timeInCurrentRange / totalRangeTime, 0), 1);
        setLiveProgress(calculatedProgress);
      }
    };

    // Initial calculation
    updateProgress();

    // Update every second
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Animate progress changes only if change is significant (>0.5% threshold)
  // Prevents animation triggers on tiny changes
  useEffect(() => {
    const threshold = 0.005; // 0.5% threshold
    if (Math.abs(currentProgress - previousProgress.current) > threshold) {
      previousProgress.current = currentProgress;
      Animated.timing(animatedProgress, {
        toValue: currentProgress,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentProgress, animatedProgress]);

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
              {Math.round(currentProgress * 100)}%
            </Text>
          )}
        </View>
      </View>

      {/* Checkpoint Label */}
      {showCheckpoint && checkpointLabel && (
        <Text className="mt-6 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
          {checkpointLabel}
        </Text>
      )}
    </View>
  );
}
