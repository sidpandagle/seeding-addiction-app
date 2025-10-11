import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { ChevronLeft, TrendingUp, TrendingDown, Calendar, Target, X } from 'lucide-react-native';
import { useRelapseStore } from '../stores/relapseStore';
import { useThemeStore } from '../stores/themeStore';
import { getJourneyStart } from '../db/helpers';

interface InsightsModalProps {
  onClose: () => void;
}

export default function InsightsModal({ onClose }: InsightsModalProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const { relapses } = useRelapseStore();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  const insights = useMemo(() => {
    if (relapses.length === 0) {
      return {
        totalDays: journeyStart ? Math.floor((Date.now() - new Date(journeyStart).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        averageStreak: 0,
        longestStreak: journeyStart ? Math.floor((Date.now() - new Date(journeyStart).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        totalRelapses: 0,
        relapseRate: 0,
        trend: 'improving' as const,
      };
    }

    // Sort relapses by timestamp (oldest first)
    const sorted = [...relapses].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate streaks
    const streaks: number[] = [];
    const startTime = journeyStart ? new Date(journeyStart).getTime() : new Date(sorted[0].timestamp).getTime();

    // First streak: from journey start to first relapse
    streaks.push(Math.floor((new Date(sorted[0].timestamp).getTime() - startTime) / (1000 * 60 * 60 * 24)));

    // Streaks between relapses
    for (let i = 0; i < sorted.length - 1; i++) {
      const streakDays = Math.floor(
        (new Date(sorted[i + 1].timestamp).getTime() - new Date(sorted[i].timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      streaks.push(streakDays);
    }

    // Current streak: from last relapse to now
    const currentStreak = Math.floor((Date.now() - new Date(sorted[sorted.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24));
    streaks.push(currentStreak);

    const longestStreak = Math.max(...streaks);
    const averageStreak = streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length;
    const totalDays = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
    const relapseRate = relapses.length / (totalDays || 1);

    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(relapses.length / 2);
    const firstHalfCount = midpoint;
    const secondHalfCount = relapses.length - midpoint;

    const firstHalfDays = sorted[midpoint]
      ? (new Date(sorted[midpoint].timestamp).getTime() - startTime) / (1000 * 60 * 60 * 24)
      : totalDays / 2;
    const secondHalfDays = (Date.now() - (sorted[midpoint] ? new Date(sorted[midpoint].timestamp).getTime() : startTime)) / (1000 * 60 * 60 * 24);

    const firstHalfRate = firstHalfCount / (firstHalfDays || 1);
    const secondHalfRate = secondHalfCount / (secondHalfDays || 1);

    const trend = secondHalfRate < firstHalfRate ? 'improving' : secondHalfRate > firstHalfRate ? 'declining' : 'stable';

    return {
      totalDays,
      averageStreak: Math.round(averageStreak),
      longestStreak,
      totalRelapses: relapses.length,
      relapseRate: relapseRate.toFixed(3),
      trend,
    };
  }, [relapses, journeyStart]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 py-6 bg-rose-50 dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Insights</Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Detailed analytics and patterns from your journey
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600"
          >
            <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
          </Pressable>
        </View>

      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Journey Overview */}
        <View className="p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
          <View className="flex-row items-center mb-2">
            <Calendar size={20} color="#10b981" />
            <Text className="ml-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Journey Overview
            </Text>
          </View>
          <Text className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {insights.totalDays} days
          </Text>
          <Text className="text-sm text-emerald-700 dark:text-emerald-300">Total journey duration</Text>
        </View>

        {/* Streak Stats */}
        <View className="flex-row mb-4 space-x-2">
          <View className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Target size={20} color="#3b82f6" />
            <Text className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {insights.longestStreak}
            </Text>
            <Text className="text-sm text-blue-700 dark:text-blue-300">Longest Streak</Text>
          </View>

          <View className="flex-1 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <TrendingUp size={20} color="#a855f7" />
            <Text className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              {insights.averageStreak}
            </Text>
            <Text className="text-sm text-purple-700 dark:text-purple-300">Average Streak</Text>
          </View>
        </View>

        {/* Relapse Stats */}
        <View className="p-4 mb-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <Text className="text-lg font-semibold text-orange-900 dark:text-orange-100">Total Relapses</Text>
          <Text className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {insights.totalRelapses}
          </Text>
          <Text className="text-sm text-orange-700 dark:text-orange-300">
            Rate: {insights.relapseRate} per day
          </Text>
        </View>

        {/* Trend */}
        <View
          className={`p-4 mb-4 rounded-xl ${insights.trend === 'improving'
            ? 'bg-green-50 dark:bg-green-900/20'
            : insights.trend === 'declining'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-gray-50 dark:bg-gray-800'
            }`}
        >
          <View className="flex-row items-center mb-2">
            {insights.trend === 'improving' ? (
              <TrendingDown size={24} color="#10b981" />
            ) : insights.trend === 'declining' ? (
              <TrendingUp size={24} color="#ef4444" />
            ) : (
              <TrendingUp size={24} color="#6b7280" />
            )}
            <Text
              className={`ml-2 text-lg font-semibold ${insights.trend === 'improving'
                ? 'text-green-900 dark:text-green-100'
                : insights.trend === 'declining'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-gray-900 dark:text-gray-100'
                }`}
            >
              {insights.trend === 'improving'
                ? 'Improving Trend 🎉'
                : insights.trend === 'declining'
                  ? 'Declining Trend'
                  : 'Stable Trend'}
            </Text>
          </View>
          <Text
            className={`text-sm ${insights.trend === 'improving'
              ? 'text-green-700 dark:text-green-300'
              : insights.trend === 'declining'
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
              }`}
          >
            {insights.trend === 'improving'
              ? 'Your relapse frequency has decreased over time. Keep it up!'
              : insights.trend === 'declining'
                ? 'Your relapse frequency has increased recently. Stay focused!'
                : 'Your progress has been consistent.'}
          </Text>
        </View>

        {/* Motivational Message */}
        <View className="p-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Text className="text-base font-medium text-gray-900 dark:text-white">
            💪 Remember: Progress isn't linear
          </Text>
          <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Every day is a new opportunity to grow stronger. Your journey is unique, and these insights are
            here to help you understand your patterns and celebrate your progress.
          </Text>
        </View>

        {/* Placeholder for future analytics */}
        <View className="p-4 mb-6 border-2 border-gray-300 border-dashed dark:border-gray-700 rounded-xl">
          <Text className="text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            More analytics coming soon...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
