import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { ChevronLeft, TrendingUp, TrendingDown, Calendar, Target, X } from 'lucide-react-native';
import { useRelapses } from '../../stores/relapseStore';
import { useUrgeStore } from '../../stores/urgeStore';
import { useColorScheme } from '../../stores/themeStore';
import { getJourneyStart } from '../../db/helpers';
import { calculateUserStats } from '../../utils/statsHelpers';
import WeeklyPatternChart from '../charts/WeeklyPatternChart';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import ResistanceRatioChart from '../charts/ResistanceRatioChart';

interface InsightsModalProps {
  onClose: () => void;
}

// Phase 2 Optimization: Memoize component to prevent re-renders when parent updates
const InsightsModal = React.memo(function InsightsModal({ onClose }: InsightsModalProps) {
  const colorScheme = useColorScheme();
  // Phase 2 Optimization: Use granular selector to only subscribe to relapses array
  const relapses = useRelapses();
  const urges = useUrgeStore((state) => state.urges);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, []);

  const insights = useMemo(() => {
    // Calculate basic stats using shared utility
    const userStats = calculateUserStats(relapses, journeyStart);
    
    if (relapses.length === 0) {
      const totalDays = journeyStart 
        ? Math.floor((Date.now() - new Date(journeyStart).getTime()) / (1000 * 60 * 60 * 24)) 
        : 0;
      
      return {
        totalDays,
        averageStreak: 0,
        longestStreak: totalDays,
        totalRelapses: 0,
        relapseRate: '0.000',
        trend: 'improving' as const,
      };
    }

    // Sort relapses by timestamp (oldest first)
    const sorted = [...relapses].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const startTime = journeyStart ? new Date(journeyStart).getTime() : new Date(sorted[0].timestamp).getTime();

    // Calculate all streaks to get average
    const streaks: number[] = [];
    
    // First streak: from journey start to first relapse
    streaks.push(Math.floor((new Date(sorted[0].timestamp).getTime() - startTime) / (1000 * 60 * 60 * 24)));

    // Streaks between relapses
    for (let i = 0; i < sorted.length - 1; i++) {
      const streakDays = Math.floor(
        (new Date(sorted[i + 1].timestamp).getTime() - new Date(sorted[i].timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      streaks.push(streakDays);
    }

    // Add current streak
    streaks.push(userStats.currentStreak);

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
      longestStreak: userStats.bestStreak,
      totalRelapses: relapses.length,
      relapseRate: relapseRate.toFixed(3),
      trend,
    };
  }, [relapses, journeyStart]);

  return (
    <View className="flex-1 pb-0 bg-gray-50 dark:bg-gray-950">
      {/* Modern Header */}
      <View className="px-6 pt-16 pb-6">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">Advanced Insights</Text>
            <Text className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Detailed analytics and patterns from your journey
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-12 h-12 bg-white rounded-2xl dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700"
          >
            <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Journey Overview */}
        <View className="p-5 mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
          <View className="flex-row items-center mb-3">
            <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Calendar size={20} color="#10b981" />
            </View>
            <Text className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Journey Overview
            </Text>
          </View>
          <Text className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {insights.totalDays} days
          </Text>
          <Text className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">Total journey duration</Text>
        </View>

        {/* Streak Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <View className="items-center justify-center w-10 h-10 mb-3 bg-blue-100 rounded-full dark:bg-blue-900/40">
              <Target size={20} color="#3b82f6" />
            </View>
            <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {insights.longestStreak}
            </Text>
            <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-300">Longest Streak</Text>
          </View>

          <View className="flex-1 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
            <View className="items-center justify-center w-10 h-10 mb-3 bg-purple-100 rounded-full dark:bg-purple-900/40">
              <TrendingUp size={20} color="#a855f7" />
            </View>
            <Text className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {insights.averageStreak}
            </Text>
            <Text className="mt-1 text-sm font-medium text-purple-700 dark:text-purple-300">Average Streak</Text>
          </View>
        </View>

        {/* Relapse Stats */}
        <View className="p-5 mb-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
          <Text className="mb-2 text-lg font-bold text-orange-900 dark:text-orange-100">Total Relapses</Text>
          <Text className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            {insights.totalRelapses}
          </Text>
          <Text className="mt-1 text-sm font-medium text-orange-700 dark:text-orange-300">
            Rate: {insights.relapseRate} per day
          </Text>
        </View>

        {/* Trend */}
        <View
          className={`p-5 mb-4 rounded-2xl ${insights.trend === 'improving'
            ? 'bg-green-50 dark:bg-green-900/20'
            : insights.trend === 'declining'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-gray-50 dark:bg-gray-800'
            }`}
        >
          <View className="flex-row items-center mb-3">
            <View className={`items-center justify-center w-10 h-10 mr-3 rounded-full ${
              insights.trend === 'improving'
                ? 'bg-green-100 dark:bg-green-900/40'
                : insights.trend === 'declining'
                  ? 'bg-red-100 dark:bg-red-900/40'
                  : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {insights.trend === 'improving' ? (
                <TrendingUp size={20} color="#10b981" />
              ) : insights.trend === 'declining' ? (
                <TrendingDown size={20} color="#ef4444" />
              ) : (
                <TrendingDown size={20} color="#6b7280" />
              )}
            </View>
            <Text
              className={`text-lg font-bold ${insights.trend === 'improving'
                ? 'text-green-900 dark:text-green-100'
                : insights.trend === 'declining'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-gray-900 dark:text-gray-100'
                }`}
            >
              {insights.trend === 'improving'
                ? 'Improving Trend 🎉'
                : insights.trend === 'declining'
                  ? 'Needs Attention'
                  : 'Stable Progress'}
            </Text>
          </View>
          <Text
            className={`text-sm leading-6 mb-2 ${insights.trend === 'improving'
              ? 'text-green-700 dark:text-green-300'
              : insights.trend === 'declining'
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
              }`}
          >
            {insights.trend === 'improving'
              ? 'Your relapse frequency is decreasing—this means longer gaps between relapses. You\'re rewiring your brain\'s reward system with each passing day. This is excellent progress!'
              : insights.trend === 'declining'
                ? 'Your relapse frequency has increased recently. Remember: recovery isn\'t linear. Even with setbacks, you\'re still learning. Consider what triggers are most challenging right now.'
                : 'Your frequency has been consistent. If you\'re maintaining a healthy resistance rate (40-60%+), this stability is actually a sign of sustainable progress.'}
          </Text>
          {insights.trend === 'stable' && (
            <View className="p-2 mt-2 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600">
              <Text className="text-xs leading-5 text-gray-600 dark:text-gray-400">
                <Text className="font-bold">Research Note:</Text> Stable patterns with good resistance rates are common in long-term recovery. Focus on maintaining your wins rather than chasing perfection.
              </Text>
            </View>
          )}
        </View>

        {/* Resistance Ratio Chart */}
        <ResistanceRatioChart relapses={relapses} urges={urges} />

        {/* Weekly Pattern Chart */}
        <WeeklyPatternChart relapses={relapses} />

        {/* Monthly Trend Chart */}
        <MonthlyTrendChart relapses={relapses} />

        {/* Motivational Message */}
        <View className="p-5 mb-12 bg-white dark:bg-gray-900 rounded-2xl">
          <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">
            💪 Remember: Progress isn't linear
          </Text>
          <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
            Every day is a new opportunity to grow stronger. Your journey is unique, and these insights are
            here to help you understand your patterns and celebrate your progress.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});

export default InsightsModal;
