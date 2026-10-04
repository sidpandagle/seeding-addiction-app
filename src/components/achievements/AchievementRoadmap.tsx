import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useColorScheme } from '../../stores/themeStore';
import { mixHex } from '../../constants/palette';
import { Achievement } from '../../utils/growthStages';
import { MapPin, Lock, CheckCircle2, Calendar } from 'lucide-react-native';

interface AchievementRoadmapProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
  referenceTime?: number | null; // Time reference for calculating predicted dates
  /** Stage the best finished streak reached, shown as a "Your best" chip on that card */
  bestMarker?: { stageId: string; label: string };
}

/**
 * Visual roadmap display for achievements
 * Shows a vertical journey path with nodes for each achievement
 */
export default function AchievementRoadmap({ achievements, onAchievementPress, referenceTime, bestMarker }: AchievementRoadmapProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  // Next Up card: a light gold wash over the card surface, softer than the gold chips
  const nextCardStyle = { backgroundColor: mixHex(colors.gold, colorScheme === 'dark' ? 12 : 10, colors.surface) };

  // Find the current achievement (last unlocked or first locked)
  const currentIndex = achievements.findIndex((a) => !a.isUnlocked);
  const activeIndex = currentIndex === -1 ? achievements.length - 1 : currentIndex;

  // Calculate predicted date for an achievement based on its threshold
  const getPredictedDate = (threshold: number): { date: Date; daysUntil: number } | null => {
    if (!referenceTime) return null;

    const targetTime = referenceTime + threshold;
    const now = Date.now();

    // Compare calendar days instead of raw time difference
    // This fixes the bug where "Today" was showing as "Tomorrow"
    const targetDate = new Date(targetTime);
    const todayDate = new Date(now);

    const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

    const daysUntil = Math.round((targetDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    return {
      date: targetDate,
      daysUntil,
    };
  };

  // Format the predicted date
  const formatPredictedDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Format days until achievement
  const formatDaysUntil = (days: number): string => {
    if (days <= 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `~${weeks}w`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `~${months}mo`;
    }
    const years = Math.floor(days / 365);
    return `~${years}y`;
  };

  const formatDuration = (threshold: number) => {
    const totalMinutes = threshold / (60 * 1000);
    const hours = threshold / (60 * 60 * 1000);
    const days = threshold / (24 * 60 * 60 * 1000);

    // For day 0, show "Start"
    if (days === 0) return 'Start';

    // For sub-hour durations, show minutes
    if (totalMinutes < 60) return `${Math.floor(totalMinutes)}m`;

    // For sub-day durations, show hours
    if (hours < 24) return `${Math.floor(hours)}h`;

    // For day-based durations, show days
    return `${Math.floor(days)}d`;
  };

  return (
    <View className="flex-1">
      {achievements.map((achievement, index) => {
        const isUnlocked = achievement.isUnlocked;
        const isCurrent = index === activeIndex;
        const isLast = index === achievements.length - 1;

        return (
          <View key={achievement.id} className="relative">
            {/* Connecting Line (before node) */}
            {index > 0 && (
              <View className="absolute left-[31px] -top-6 w-0.5 h-6">
                <View
                  className={`w-full h-full ${
                    isUnlocked
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                />
              </View>
            )}

            {/* Achievement Node */}
            <Pressable
              onPress={() => onAchievementPress(achievement)}
              className="flex-row items-center mb-6"
            >
              {/* Timeline Node */}
              <View className="relative mr-4">
                {/* Node Circle */}
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center ${
                    isUnlocked
                      ? 'bg-primary'
                      : isCurrent
                      ? 'bg-gold'
                      : 'bg-border'
                  }`}
                >
                  {isUnlocked ? (
                    <CheckCircle2 size={28} color={colors.onPrimary} strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <MapPin size={28} color={colors.onPrimary} strokeWidth={2.5} />
                  ) : (
                    <Lock size={24} color={colors.muted} strokeWidth={2} />
                  )}
                </View>

                {/* Pulse Animation for Current */}
                {isCurrent && !isUnlocked && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="w-20 h-20 rounded-full bg-gold/20" />
                  </View>
                )}

                {/* Timeline Label */}
                <View className="absolute -left-1 -bottom-6">
                  <Text className="text-xs font-semibold text-muted">
                    {formatDuration(achievement.threshold)}
                  </Text>
                </View>
              </View>

              {/* Achievement Card */}
              <View
                style={!isUnlocked && isCurrent ? nextCardStyle : undefined}
                className={`flex-1 p-4 rounded-2xl ${
                  isUnlocked
                    ? 'bg-surface border border-primary/30'
                    : isCurrent
                    ? 'border border-gold/40'
                    : 'bg-border/45 border border-border'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 gap-2">
                    <Text className="font-regular text-2xl">{achievement.emoji}</Text>
                    {bestMarker?.stageId === achievement.id && (
                      <View className="px-2 py-0.5 border border-dashed rounded-full border-gold bg-gold-soft">
                        <Text className="text-xs font-bold text-gold-ink">
                          🏁 Your best · {bestMarker.label}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isCurrent && !isUnlocked && (
                    <View className="px-2 py-1 rounded-full bg-gold-soft">
                      <Text className="text-xs font-bold text-gold-ink">
                        Next Up
                      </Text>
                    </View>
                  )}
                  {isUnlocked && (
                    <View className="px-2 py-1 rounded-full bg-primary-soft">
                      <Text className="text-xs font-bold text-primary-ink">
                        Unlocked
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  className={`text-base font-bold mb-1 ${
                    isUnlocked || isCurrent
                      ? 'text-fg'
                      : 'text-faint'
                  }`}
                >
                  {achievement.title}
                </Text>

                <Text
                  className={`font-regular text-sm leading-5 ${
                    isUnlocked || isCurrent
                      ? 'text-muted'
                      : 'text-faint'
                  }`}
                >
                  {achievement.description}
                </Text>

                {achievement.unlockedAt && (
                  <Text className="mt-2 text-xs font-medium text-primary-ink">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Text>
                )}

                {/* Predicted date for locked achievements */}
                {!isUnlocked && (() => {
                  const prediction = getPredictedDate(achievement.threshold);
                  if (!prediction) return null;

                  return (
                    <View className="flex-row items-center mt-2 gap-1.5">
                      <Calendar size={12} color={isCurrent ? colors.gold : colors.faint} strokeWidth={2} />
                      <Text className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-gold-ink'
                          : 'text-faint'
                      }`}>
                        {formatPredictedDate(prediction.date)} ({formatDaysUntil(prediction.daysUntil)})
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </Pressable>

            {/* Connecting Line (after node) */}
            {!isLast && (
              <View className="absolute left-[31px] bottom-0 w-0.5 h-6">
                <View
                  className={`w-full h-full ${
                    isUnlocked
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
