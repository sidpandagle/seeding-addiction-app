import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Target, Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { GROWTH_STAGES } from '../../utils/growthStages';

interface MilestonePredictionsCardProps {
  journeyStartTime: number | null;
  lastRelapseTime: number | null;
}

interface MilestonePrediction {
  stage: typeof GROWTH_STAGES[0];
  targetDate: Date;
  daysUntil: number;
  isAchieved: boolean;
}

const MilestonePredictionsCard: React.FC<MilestonePredictionsCardProps> = ({
  journeyStartTime,
  lastRelapseTime,
}) => {
  const predictions = useMemo(() => {
    if (!journeyStartTime) return [];

    const referenceTime = lastRelapseTime || journeyStartTime;
    const now = Date.now();
    const elapsedMs = now - referenceTime;
    const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);

    const results: MilestonePrediction[] = [];

    // Get next 5 upcoming milestones + show last achieved one
    let achievedCount = 0;
    let upcomingCount = 0;

    for (const stage of GROWTH_STAGES) {
      const isAchieved = elapsedDays >= stage.minDays;
      const targetMs = referenceTime + (stage.minDays * 24 * 60 * 60 * 1000);
      const targetDate = new Date(targetMs);
      const daysUntil = Math.ceil((targetMs - now) / (24 * 60 * 60 * 1000));

      if (isAchieved) {
        achievedCount++;
        // Only keep the last achieved milestone
        if (results.length > 0 && results[results.length - 1].isAchieved) {
          results.pop();
        }
        results.push({ stage, targetDate, daysUntil, isAchieved });
      } else if (upcomingCount < 5) {
        results.push({ stage, targetDate, daysUntil, isAchieved });
        upcomingCount++;
      }
    }

    return results;
  }, [journeyStartTime, lastRelapseTime]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDaysUntil = (days: number) => {
    if (days <= 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  if (!journeyStartTime) {
    return (
      <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
        <View className="flex-row items-center mb-3">
          <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Target size={20} color="#f59e0b" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Milestone Predictions
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Start your journey to see milestone predictions
        </Text>
      </View>
    );
  }

  return (
    <View className="p-5 mb-4 bg-white dark:bg-gray-900 rounded-2xl">
      <View className="flex-row items-center mb-4">
        <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Target size={20} color="#f59e0b" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Milestone Predictions
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Your upcoming achievements
          </Text>
        </View>
      </View>

      {predictions.map((prediction, index) => (
        <View
          key={prediction.stage.id}
          className={`flex-row items-center py-3 ${
            index < predictions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
          }`}
        >
          {/* Emoji */}
          <View className={`items-center justify-center w-12 h-12 rounded-xl mr-3 ${
            prediction.isAchieved
              ? 'bg-emerald-100 dark:bg-emerald-900/40'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <Text className="text-2xl">{prediction.stage.emoji}</Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className={`text-base font-bold ${
                prediction.isAchieved
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {prediction.stage.label}
              </Text>
              {prediction.isAchieved && (
                <CheckCircle size={16} color="#10b981" strokeWidth={2.5} />
              )}
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {prediction.stage.shortLabel} milestone
            </Text>
          </View>

          {/* Date/Status */}
          <View className="items-end">
            {prediction.isAchieved ? (
              <View className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Achieved!
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center gap-1 mb-1">
                  <Calendar size={12} color="#6B7280" strokeWidth={2.5} />
                  <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {formatDate(prediction.targetDate)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color="#f59e0b" strokeWidth={2.5} />
                  <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {formatDaysUntil(prediction.daysUntil)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      ))}

      {/* Motivational Footer */}
      <View className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <Text className="text-xs text-center text-amber-700 dark:text-amber-300">
          🌟 Keep going! Each milestone brings you closer to lasting change.
        </Text>
      </View>
    </View>
  );
};

export default MilestonePredictionsCard;
