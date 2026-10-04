import { useEffect, useRef, useState, memo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Relapse } from '../../db/schema';
import type { Streak } from '../../utils/streaks';
import { getGrowthStage, getNextStageTime, GROWTH_STAGES, getStageIndex } from '../../utils/growthStages';
import { formatStreakLength, formatTimeLeft } from '../../utils/formatDuration';
import { formatRelapseTag } from '../../constants/tags';
import { toWholeDays } from '../../utils/streaks';
import { palette, withAlpha } from '../../constants/palette';
import { useCardShadow } from '../../hooks/useThemeColors';

// Soft gold glow behind the best streak's plant
const BEST_GLOW = withAlpha(palette.dark.gold, 0.7);

interface GardenViewProps {
  /** Oldest first; the last one is the current streak */
  streaks: Streak<Relapse>[];
  onEditRelapse?: (relapse: Relapse) => void;
}

const COLUMN_WIDTH = 56;
const STEM_MAX_HEIGHT = 110;
const STEM_MIN_HEIGHT = 4;
const PLOT_HEIGHT = STEM_MAX_HEIGHT + 34; // room for the emoji on the tallest stem
const DASH = 5;
const DASH_GAP = 3;

const formatDay = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function formatLength(ms: number): string {
  const days = toWholeDays(ms);
  return days >= 1 ? `${days} ${days === 1 ? 'day' : 'days'}` : formatStreakLength(ms);
}

/** The still-growing stem is dashed, drawn as short segments (RN dashed borders are unreliable on one side) */
function DashedStem({ height }: { height: number }) {
  const count = Math.max(1, Math.floor(height / (DASH + DASH_GAP)));
  return (
    <View style={{ height, justifyContent: 'flex-end' }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className="w-[3px] bg-primary" style={{ height: DASH, marginTop: DASH_GAP }} />
      ))}
    </View>
  );
}

/**
 * Every streak as a plant: stem height is its length, the emoji is the stage it reached.
 * Tap a plant to see its dates and the relapse that ended it.
 */
function GardenViewComponent({ streaks, onEditRelapse }: GardenViewProps) {
  const cardShadow = useCardShadow();
  const [selected, setSelected] = useState(streaks.length - 1);
  const scrollRef = useRef<ScrollView>(null);
  const scrolledToEndRef = useRef(false);

  // A new relapse adds a plant: select the new current one
  useEffect(() => {
    setSelected(streaks.length - 1);
  }, [streaks.length]);

  if (streaks.length === 0) {
    return (
      <View className="items-center p-8 mx-6 bg-surface border border-border rounded-2xl">
        <Text className="font-regular text-4xl">🫘</Text>
        <Text className="mt-3 text-base font-semibold text-center text-body">
          Your garden starts when your journey does.
        </Text>
      </View>
    );
  }

  const maxMs = Math.max(...streaks.map((s) => s.durationMs), 1);
  const bestMs = Math.max(...streaks.map((s) => s.durationMs));
  const index = Math.min(selected, streaks.length - 1);
  const streak = streaks[index];
  const stage = getGrowthStage(streak.durationMs);
  const ended = streak.endedBy;

  let nextLine: string | null = null;
  if (streak.isCurrent) {
    const nextTime = getNextStageTime(streak.start, streak.end);
    const next = GROWTH_STAGES[getStageIndex(streak.durationMs) + 1];
    nextLine = nextTime && next
      ? `Still growing. Next: ${next.emoji} ${next.label} in ${formatTimeLeft(nextTime - streak.end)}.`
      : 'Still growing. Every milestone reached.';
  }

  return (
    <View style={cardShadow} className="p-4 mx-6 bg-surface border border-border rounded-[20px]">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-fg">Your garden</Text>
        <Text className="text-sm font-medium text-muted">
          {streaks.length} {streaks.length === 1 ? 'plant' : 'plants'} grown
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => {
          // Open on the newest plants
          if (!scrolledToEndRef.current) {
            scrolledToEndRef.current = true;
            scrollRef.current?.scrollToEnd({ animated: false });
          }
        }}
      >
        <View className="flex-row">
          {streaks.map((s, i) => {
            const plantStage = getGrowthStage(s.durationMs);
            const stemHeight = Math.max(STEM_MIN_HEIGHT, Math.round((s.durationMs / maxMs) * STEM_MAX_HEIGHT));
            const isSelected = i === index;
            const isBest = s.durationMs === bestMs && streaks.length > 1;
            return (
              <Pressable
                key={`${s.start}-${i}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(i);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${formatLength(s.durationMs)} streak from ${formatDay(s.start)}, reached ${plantStage.label}${s.isCurrent ? ', still growing' : ''}${isBest ? ', your best' : ''}`}
                style={{ width: COLUMN_WIDTH }}
                className={`items-center rounded-t-xl ${isSelected ? 'bg-subtle' : ''}`}
              >
                <View style={{ height: PLOT_HEIGHT }} className="items-center justify-end">
                  <Text
                    style={[
                      { fontSize: 20, marginBottom: -2 },
                      isBest && { textShadowColor: BEST_GLOW, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
                    ]}
                  >
                    {plantStage.emoji}
                  </Text>
                  {s.isCurrent ? (
                    <DashedStem height={stemHeight} />
                  ) : (
                    <View className="w-[3px] rounded-t-sm bg-primary" style={{ height: stemHeight }} />
                  )}
                </View>
                {/* Ground line, continuous across columns */}
                <View className="self-stretch h-[3px] bg-border" />
                <View className={`items-center w-full pt-1.5 pb-2 ${isSelected ? 'rounded-b-lg' : ''}`}>
                  <Text className={`text-xs font-semibold ${s.isCurrent ? 'text-primary' : 'text-fg'}`}>
                    {formatStreakLength(s.durationMs)}
                  </Text>
                  <Text className="text-xs font-regular text-muted">
                    {s.isCurrent ? 'now' : formatDay(s.start)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Details of the tapped plant */}
      <View className="gap-2 pt-3 mt-2 border-t border-border">
        <Text className="text-sm font-semibold text-fg">
          {stage.emoji} {formatLength(streak.durationMs)} · {formatDay(streak.start)} – {streak.isCurrent ? 'now' : formatDay(streak.end)} · reached {stage.label}
        </Text>

        {nextLine && <Text className="text-sm text-muted font-regular">{nextLine}</Text>}

        {ended && (
          <>
            <Text className="text-sm text-muted font-regular">
              {ended.tags && ended.tags.length > 0 ? 'Ended by a relapse tagged' : 'Ended by a relapse'}
            </Text>
            {ended.tags && ended.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {ended.tags.map((tag) => (
                  <View key={tag} className="px-3 py-1 rounded-full bg-relapse-soft">
                    <Text className="text-xs font-bold text-relapse-ink">{formatRelapseTag(tag)}</Text>
                  </View>
                ))}
              </View>
            )}
            {ended.note && (
              <Text numberOfLines={3} className="text-sm italic text-muted font-regular">
                “{ended.note}”
              </Text>
            )}
            {onEditRelapse && (
              <Pressable onPress={() => onEditRelapse(ended)} accessibilityRole="button" hitSlop={8} className="self-start">
                <Text className="text-xs font-semibold text-muted">Edit this relapse ›</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

export const GardenView = memo(GardenViewComponent);
