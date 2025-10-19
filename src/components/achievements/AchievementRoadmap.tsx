import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { Achievement } from '../../utils/growthStages';
import { MapPin, Lock, CheckCircle2 } from 'lucide-react-native';

interface AchievementRoadmapProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
}

/**
 * Visual roadmap display for achievements
 * Shows a vertical journey path with nodes for each achievement
 */
export default function AchievementRoadmap({ achievements, onAchievementPress }: AchievementRoadmapProps) {
  const colorScheme = useColorScheme();

  // Find the current achievement (last unlocked or first locked)
  const currentIndex = achievements.findIndex((a) => !a.isUnlocked);
  const activeIndex = currentIndex === -1 ? achievements.length - 1 : currentIndex;

  const formatDuration = (threshold: number) => {
    const minutes = threshold / (60 * 1000);
    const hours = threshold / (60 * 60 * 1000);
    const days = threshold / (24 * 60 * 60 * 1000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    return `${Math.floor(days / 30)}mo`;
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
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-gray-200 dark:bg-gray-800'
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
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : isCurrent
                      ? 'bg-amber-500 dark:bg-amber-600'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  {isUnlocked ? (
                    <CheckCircle2 size={28} color="#FFFFFF" strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <MapPin size={28} color="#FFFFFF" strokeWidth={2.5} />
                  ) : (
                    <Lock size={24} color={colorScheme === 'dark' ? '#4b5563' : '#9ca3af'} strokeWidth={2} />
                  )}
                </View>

                {/* Pulse Animation for Current */}
                {isCurrent && !isUnlocked && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="w-20 h-20 bg-amber-500/20 dark:bg-amber-600/20 rounded-full" />
                  </View>
                )}

                {/* Timeline Label */}
                <View className="absolute -left-1 -bottom-6">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {formatDuration(achievement.threshold)}
                  </Text>
                </View>
              </View>

              {/* Achievement Card */}
              <View
                className={`flex-1 p-4 rounded-2xl ${
                  isUnlocked
                    ? 'bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/50'
                    : isCurrent
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50'
                    : 'bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl">{achievement.emoji}</Text>
                  {isCurrent && !isUnlocked && (
                    <View className="px-2 py-1 bg-amber-500/20 dark:bg-amber-600/30 rounded-full">
                      <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Next Up
                      </Text>
                    </View>
                  )}
                  {isUnlocked && (
                    <View className="px-2 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-600/30">
                      <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Unlocked
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  className={`text-base font-bold mb-1 ${
                    isUnlocked || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {achievement.title}
                </Text>

                <Text
                  className={`text-sm leading-5 ${
                    isUnlocked || isCurrent
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {achievement.description}
                </Text>

                {achievement.unlockedAt && (
                  <Text className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Connecting Line (after node) */}
            {!isLast && (
              <View className="absolute left-[31px] bottom-0 w-0.5 h-6">
                <View
                  className={`w-full h-full ${
                    isUnlocked
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-gray-200 dark:bg-gray-800'
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
