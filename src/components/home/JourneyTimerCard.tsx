import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { millisecondsToTimeBreakdown, getCheckpointProgress } from '../../utils/growthStages';

interface JourneyTimerCardProps {
  startTime: string; // ISO timestamp
  growthStage: {
    emoji: string;
    achievementTitle: string;
    description: string;
  };
  nextCheckpoint?: {
    shortLabel: string;
  } | null;
}

/**
 * Progress Indicator Component - Shows checkpoint progress with nodes and edges
 * Optimized for performance with memoization
 */
const ProgressIndicator: React.FC<{ progress: number; colorScheme: 'light' | 'dark' }> = memo(({ progress, colorScheme }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for current progress node
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const nodes = [0, 0.25, 0.5, 0.75, 1]; // 5 nodes: 0%, 25%, 50%, 75%, 100%

  // Memoize calculations to prevent unnecessary recalculations
  const progressPercent = useMemo(() => Math.round(progress * 100), [progress]);

  // Memoize current node calculation
  const currentNodeIndex = useMemo(() => {
    return nodes.findIndex((node, idx) => {
      if (idx === nodes.length - 1) return progress >= node;
      return progress >= node && progress < nodes[idx + 1];
    });
  }, [progress, nodes]);

  return (
    <View className="items-center px-4 pb-4">
      {/* Percentage Display */}
      <View className="mb-3">
        <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {progressPercent}% to next milestone
        </Text>
      </View>

      {/* Progress Path */}
      <View className="flex-row items-center justify-center w-full px-4">
        {nodes.map((nodeValue, index) => {
          const isCompleted = progress >= nodeValue;
          const isCurrent = index === currentNodeIndex;
          const isLastNode = index === nodes.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Node */}
              <View className="items-center justify-center">
                {isCurrent && progress < 1 ? (
                  // Pulsing current node
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseAnim }],
                    }}
                    className="items-center justify-center w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400"
                  >
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                  </Animated.View>
                ) : (
                  // Static node
                  <View
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-600 dark:bg-emerald-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </View>

              {/* Edge (connecting line) */}
              {!isLastNode && (
                <View
                  className={`h-0.5 flex-1 mx-1 ${
                    progress > nodeValue + 0.125 // Middle of segment
                      ? 'bg-emerald-600 dark:bg-emerald-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ minWidth: 30, maxWidth: 50 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

/**
 * Journey Timer Card - Displays current streak time in a card layout
 * Styled to match MotivationCard (Daily Inspiration) design
 * Simple, performant, no circular progress complexity
 */
const JourneyTimerCardComponent: React.FC<JourneyTimerCardProps> = ({
  startTime,
  growthStage,
  nextCheckpoint,
}) => {
  const colorScheme = useColorScheme();
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    // Update timer every second
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time
  const elapsed = Math.max(0, time - new Date(startTime).getTime());
  const { days, hours, minutes, seconds } = millisecondsToTimeBreakdown(elapsed);

  // Calculate checkpoint progress for the progress indicator
  const checkpointProgress = useMemo(() => {
    return getCheckpointProgress(elapsed);
  }, [elapsed]);

  // Get progress value (0 to 1)
  const progressValue = checkpointProgress.progress;

  return (
    <View className="px-6">
      {/* Card with Background Icon - Same style as Daily Inspiration */}
      <View
        style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
        className="relative overflow-hidden border border-gray-200 shadow-md rounded-2xl dark:border-gray-700"
      >
        <View className="p-6">
          {/* Decorative Background Icon - Bottom Right */}
          <View className="absolute bottom-[-20px] right-[-20px] opacity-10 dark:opacity-5">
            <Text className="text-[140px]">{growthStage.emoji}</Text>
          </View>

          {/* Content Layer */}
          <View className="relative">
            {/* Main Timer Display - Stacked with Units */}
            <View className="flex-row items-start justify-center gap-3 px-2 py-4 mb-4">
              {/* Days (only show if > 0) */}
              {days > 0 && (
                <>
                  <View className="items-center min-w-[60px]">
                    <Text className={`font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 ${ days > 0 ? 'text-4xl' : 'text-5xl'}`}>
                      {days}
                    </Text>
                    <Text className="mt-1 text-xs font-bold tracking-wide uppercase text-emerald-700/70 dark:text-emerald-300/70">
                      {days === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                  <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>
                </>
              )}

              {/* Hours */}
              <View className="items-center min-w-[60px]">
                <Text className={`font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 ${ days > 0 ? 'text-4xl' : 'text-5xl'}`}>
                  {hours.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-wide uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Hours
                </Text>
              </View>

              {/* Separator */}
              <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>

              {/* Minutes */}
              <View className="items-center min-w-[60px]">
                <Text className={`font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 ${ days > 0 ? 'text-4xl' : 'text-5xl'}`}>
                  {minutes.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-wide uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Mins
                </Text>
              </View>

              {/* Separator */}
              <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>

              {/* Seconds */}
              <View className="items-center min-w-[60px]">
                <Text className={`font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 ${ days > 0 ? 'text-4xl' : 'text-5xl'}`}>
                  {seconds.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-wide uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Secs
                </Text>
              </View>
            </View>

            {/* Progress Indicator - Only show if there's a next checkpoint */}
            {nextCheckpoint && (
              <ProgressIndicator progress={progressValue} colorScheme={colorScheme} />
            )}

            {/* Next Goal */}
            {nextCheckpoint && (
              <View className="flex-row items-center justify-center gap-2 text-center">
                <Text className="text-xl">🎯</Text>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Next Goal:{' '}
                  <Text className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {nextCheckpoint.shortLabel}
                  </Text>
                </Text>
              </View>
            )}

            {/* All milestones achieved */}
            {!nextCheckpoint && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🏆</Text>
                <Text className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  All milestones achieved!
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// Export memoized version to prevent parent re-renders
export const JourneyTimerCard = memo(JourneyTimerCardComponent);
