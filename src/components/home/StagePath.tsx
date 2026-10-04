import React, { memo, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { GROWTH_STAGES } from '../../utils/growthStages';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StagePathProps {
  /** Index of the current stage in GROWTH_STAGES */
  stageIndex: number;
  /** Progress toward the next stage, 0 to 1 */
  progress: number;
  onPress?: () => void;
}

// Two stages behind, the current one, two ahead
const WINDOW_SIZE = 5;
const COLUMN_PCT = 100 / WINDOW_SIZE;
// Circle sizes. Five columns share the card width (about 53dp each on a 360dp phone), and the
// current circle sits next to a regular one, so (NOW_SIZE + STOP_SIZE) / 2 must stay under a column.
const NOW_SIZE = 52;
const STOP_SIZE = 42;
const ROW_HEIGHT = NOW_SIZE + 2;
const LINE_TOP = ROW_HEIGHT / 2 - 1;

/**
 * Five-stop window of the 14 growth stages, shown in the Home timer card.
 * Every stop is a real milestone. Bubbles use solid fills so the line never shows through.
 */
function StagePathComponent({ stageIndex, progress, onPress }: StagePathProps) {
  const reducedMotion = useReducedMotion();
  const first = Math.min(Math.max(stageIndex - 2, 0), GROWTH_STAGES.length - WINDOW_SIZE);
  const stops = GROWTH_STAGES.slice(first, first + WINDOW_SIZE);
  const current = GROWTH_STAGES[stageIndex];
  const next = GROWTH_STAGES[stageIndex + 1];

  // The current emoji grows from 0.85x to 1.15x through the stage, and pops once when the stage changes
  const growScale = 0.85 + 0.3 * Math.min(Math.max(progress, 0), 1);
  const pop = useSharedValue(1);
  const previousStageRef = useRef(stageIndex);
  useEffect(() => {
    if (previousStageRef.current !== stageIndex && !reducedMotion) {
      pop.value = withSequence(withTiming(1.35, { duration: 160 }), withSpring(1, { damping: 8 }));
    }
    previousStageRef.current = stageIndex;
  }, [stageIndex, reducedMotion, pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const accessibilityLabel = next
    ? `${current.label}, current stage. ${Math.round(progress * 100)} percent of the way to ${next.label}. Opens achievements.`
    : `${current.label}. All milestones reached. Opens achievements.`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-full mt-4"
    >
      <View style={{ height: ROW_HEIGHT }}>
        {/* Connecting lines, drawn first so the bubbles sit on top */}
        {stops.slice(1).map((stop, k) => {
          const stopIndex = first + k + 1;
          const fill = stopIndex <= stageIndex ? 1 : stopIndex === stageIndex + 1 ? progress : 0;
          return (
            <View
              key={`line-${stop.id}`}
              className="absolute h-0.5 bg-border"
              style={{ left: `${(k + 0.5) * COLUMN_PCT}%`, width: `${COLUMN_PCT}%`, top: LINE_TOP }}
            >
              {fill > 0 && (
                <View className="h-full bg-primary" style={{ width: `${fill * 100}%` }} />
              )}
            </View>
          );
        })}

        {/* Stops */}
        <View className="absolute inset-0 flex-row">
          {stops.map((stop, k) => {
            const stopIndex = first + k;
            const isDone = stopIndex < stageIndex;
            const isNow = stopIndex === stageIndex;
            return (
              <View key={stop.id} style={{ width: `${COLUMN_PCT}%` }} className="items-center justify-center">
                {isNow ? (
                  <View
                    style={{ width: NOW_SIZE, height: NOW_SIZE }}
                    className="items-center justify-center border-2 rounded-full border-primary bg-primary-soft"
                  >
                    <Reanimated.View style={popStyle}>
                      <Text style={{ fontSize: 28, transform: [{ scale: growScale }] }}>{stop.emoji}</Text>
                    </Reanimated.View>
                  </View>
                ) : (
                  <View
                    style={{ width: STOP_SIZE, height: STOP_SIZE }}
                    className={`items-center justify-center border rounded-full ${
                      isDone
                        ? 'border-primary bg-primary-soft'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text style={{ fontSize: 21, opacity: isDone ? 1 : 0.3 }}>{stop.emoji}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Labels */}
      <View className="flex-row mt-1">
        {stops.map((stop, k) => {
          const isNow = first + k === stageIndex;
          return (
            <Text
              key={`label-${stop.id}`}
              style={{ width: `${COLUMN_PCT}%` }}
              className={`text-xs text-center ${
                isNow ? 'font-bold text-primary-ink' : 'font-medium text-muted'
              }`}
            >
              {stop.minDays === 0 ? 'Start' : stop.shortLabel}
            </Text>
          );
        })}
      </View>
    </Pressable>
  );
}

export const StagePath = memo(StagePathComponent);
