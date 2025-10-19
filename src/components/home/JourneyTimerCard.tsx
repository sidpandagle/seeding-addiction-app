import React, { useState, useEffect, memo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { millisecondsToTimeBreakdown } from '../../utils/growthStages';

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

  return (
    <View className="px-6">
      {/* Card with Background Icon - Same style as Daily Inspiration */}
      <View
        style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
        className="relative overflow-hidden shadow-md rounded-2xl"
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
                  <View className="items-center min-w-[70px]">
                    <Text className="text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                      {days}
                    </Text>
                    <Text className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/70">
                      {days === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                  <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>
                </>
              )}

              {/* Hours */}
              <View className="items-center min-w-[70px]">
                <Text className="text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {hours.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Hours
                </Text>
              </View>

              {/* Separator */}
              <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>

              {/* Minutes */}
              <View className="items-center min-w-[70px]">
                <Text className="text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {minutes.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Mins
                </Text>
              </View>

              {/* Separator */}
              <Text className="pt-2 text-4xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30">:</Text>

              {/* Seconds */}
              <View className="items-center min-w-[70px]">
                <Text className="text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {seconds.toString().padStart(2, '0')}
                </Text>
                <Text className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/70">
                  Secs
                </Text>
              </View>
            </View>

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
