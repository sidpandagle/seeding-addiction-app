import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Reanimated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme, useThemeStore } from '../../stores/themeStore';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { mixHex, stageTintColor } from '../../constants/palette';
import {
  GROWTH_STAGES,
  millisecondsToTimeBreakdown,
  getCheckpointProgress,
  getStageIndex,
} from '../../utils/growthStages';
import { daysToMilliseconds, MS_PER_MINUTE, MS_PER_SECOND } from '../../constants/timeUnits';
import { formatTimeLeft } from '../../utils/formatDuration';
import { useElapsedTick } from '../../hooks/useClock';
import { useReducedMotion, ANIMATION_PRESETS } from '../../hooks/useReducedMotion';
import { StagePath } from './StagePath';

interface JourneyTimerCardProps {
  startTime: string | null; // ISO timestamp (can be null while loading)
}

// Stage tint wash: a 160° gradient, from the stage color mixed into the surface to a faint trace.
// expo-linear-gradient takes points, so 160° becomes a line from near top-left to near bottom-right.
const TINT_START = { x: 0.33, y: 0.03 };
const TINT_END = { x: 0.67, y: 0.97 };
const TINT_LOCATIONS = [0, 0.7] as const;
const TINT_PERCENT = { light: [16, 4], dark: [22, 6] } as const;

const DIGIT_CLASS = 'font-extrabold tracking-tight';
// Every digit takes the same width, so the row doesn't shift as the seconds tick
const DIGIT_STYLE = { fontVariant: ['tabular-nums' as const] };
const UNIT_CLASS = 'mt-1 text-xs font-bold tracking-wide uppercase text-muted';
const SEPARATOR_CLASS = 'pt-2 text-4xl font-extrabold text-muted/60';

/**
 * Seconds digits with their own 1 s tick, so only this text redraws every second.
 * The tick stops while Home isn't visible or the app is in the background.
 */
const LiveSeconds = memo(function LiveSeconds({ startMs, sizeClass }: { startMs: number; sizeClass: string }) {
  const now = useElapsedTick(startMs, MS_PER_SECOND);
  const seconds = Math.floor(Math.max(0, now - startMs) / MS_PER_SECOND) % 60;
  return (
    <Text className={`${DIGIT_CLASS} ${sizeClass} text-fg`} style={DIGIT_STYLE}>
      {seconds.toString().padStart(2, '0')}
    </Text>
  );
});

/** `lead` marks the first unit shown (days, or hours under a day), drawn in the brand ink */
function TimeUnit({ value, unit, sizeClass, lead = false }: { value: string; unit: string; sizeClass: string; lead?: boolean }) {
  return (
    <View className="items-center min-w-[60px]">
      <Text className={`${DIGIT_CLASS} ${sizeClass} ${lead ? 'text-primary-ink' : 'text-fg'}`} style={DIGIT_STYLE}>
        {value}
      </Text>
      <Text className={UNIT_CLASS}>{unit}</Text>
    </View>
  );
}

/**
 * Journey Timer Card - current streak, stage path and time to the next stage.
 * Re-renders once per elapsed minute; the seconds digits tick on their own.
 */
const JourneyTimerCardComponent: React.FC<JourneyTimerCardProps> = ({ startTime }) => {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const stageTint = useThemeStore((state) => state.stageTint);
  const reducedMotion = useReducedMotion();
  const router = useRouter();

  const startMs = startTime ? new Date(startTime).getTime() : null;
  const now = useElapsedTick(startMs, MS_PER_MINUTE);


  // Entrance animation (respects reduced motion)
  const enteringAnimation = reducedMotion ? undefined : FadeIn.duration(ANIMATION_PRESETS.card.duration);

  // Show loading state if startTime is not yet available
  if (startMs === null) {
    return (
      <View className="px-6">
        <View
          style={cardShadow}
          className="relative border border-border bg-surface rounded-[20px]"
        >
          <View className="items-center justify-center p-6" style={{ minHeight: 250 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="font-regular mt-4 text-sm text-muted">Loading your journey...</Text>
          </View>
        </View>
      </View>
    );
  }

  const elapsed = Math.max(0, now - startMs);
  const { days, hours, minutes } = millisecondsToTimeBreakdown(elapsed);
  const stageIndex = getStageIndex(elapsed);
  const stage = GROWTH_STAGES[stageIndex];
  // A streak that started this instant is already in the first stage
  const { progress, nextCheckpoint } = getCheckpointProgress(Math.max(elapsed, 1));
  const timeLeft = nextCheckpoint ? startMs + daysToMilliseconds(nextCheckpoint.minDays) - now : 0;
  const sizeClass = days > 0 ? 'text-4xl' : 'text-5xl';

  const [tintFrom, tintTo] = TINT_PERCENT[colorScheme];
  const stageColor = stageTintColor(stageIndex);
  const tintColors = [mixHex(stageColor, tintFrom, colors.surface), mixHex(stageColor, tintTo, colors.surface)] as const;

  const timerLabel = `${days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}, ` : ''}${hours} ${hours === 1 ? 'hour' : 'hours'}, ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

  return (
    <Reanimated.View entering={enteringAnimation} className="px-6">
      {/* Shadow on the outer view: iOS clips shadows on overflow-hidden views */}
      <View style={cardShadow} className="bg-surface rounded-[20px]">
        <View className="relative overflow-hidden border border-border bg-surface rounded-[20px]">
          {stageTint && (
            <LinearGradient
              colors={tintColors}
              locations={TINT_LOCATIONS}
              start={TINT_START}
              end={TINT_END}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
          )}

          <View className="p-6">
            {/* Decorative Background Icon - Bottom Right */}
            <View className="absolute bottom-[-20px] right-[-20px] opacity-10 dark:opacity-5">
              <Text className="font-regular text-[140px]">{stage.emoji}</Text>
            </View>

            <View className="relative">
              {/* Timer: one label for screen readers instead of reading each digit */}
              <View
                accessible
                accessibilityRole="timer"
                accessibilityLabel={`Current streak: ${timerLabel}`}
                className="flex-row items-start justify-center gap-3 px-2 py-2"
              >
                {days > 0 && (
                  <>
                    <TimeUnit value={String(days)} unit={days === 1 ? 'Day' : 'Days'} sizeClass={sizeClass} lead />
                    <Text className={SEPARATOR_CLASS}>:</Text>
                  </>
                )}
                <TimeUnit value={hours.toString().padStart(2, '0')} unit="Hours" sizeClass={sizeClass} lead={days === 0} />
                <Text className={SEPARATOR_CLASS}>:</Text>
                <TimeUnit value={minutes.toString().padStart(2, '0')} unit="Mins" sizeClass={sizeClass} />
                <Text className={SEPARATOR_CLASS}>:</Text>
                <View className="items-center min-w-[60px]">
                  <LiveSeconds startMs={startMs} sizeClass={sizeClass} />
                  <Text className={UNIT_CLASS}>Secs</Text>
                </View>
              </View>

              <StagePath
                stageIndex={stageIndex}
                progress={nextCheckpoint ? progress : 1}
                onPress={() => router.navigate('/achievements')}
              />

              {/* Next stage and how long until it */}
              <View className="flex-row items-center justify-center mt-4">
                {nextCheckpoint ? (
                  <Text className="text-sm font-medium text-muted">
                    Next: {nextCheckpoint.emoji} {nextCheckpoint.label} in{' '}
                    <Text className="font-semibold text-primary-ink">{formatTimeLeft(timeLeft)}</Text>
                  </Text>
                ) : (
                  <Text className="text-sm font-semibold text-primary-ink">
                    🏆 All milestones reached
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Reanimated.View>
  );
};

// Export memoized version to prevent parent re-renders
export const JourneyTimerCard = memo(JourneyTimerCardComponent);
