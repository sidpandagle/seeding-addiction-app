import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import type { Relapse, Activity } from '../../db/schema';
import { Info, X, Check, Sparkles } from 'lucide-react-native';
import { InsightCallout } from './InsightCallout';
import { DonutRing } from './DonutRing';

interface ResistanceRatioChartProps {
  relapses: Relapse[];
  activities: Activity[];
}

export default function ResistanceRatioChart({ relapses, activities }: Readonly<ResistanceRatioChartProps>) {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const [showInfo, setShowInfo] = useState(false);

  const activityCount = activities.length;
  const relapseCount = relapses.length;
  const totalEvents = activityCount + relapseCount;

  // Calculate percentages
  const activityPercentage = totalEvents > 0 ? Math.round((activityCount / totalEvents) * 100) : 0;
  const relapsePercentage = totalEvents > 0 ? Math.round((relapseCount / totalEvents) * 100) : 0;

  // If no data, show empty state
  if (totalEvents === 0) {
    return (
      <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
        <Text className="mb-1 text-lg font-bold text-fg">Engagement Ratio</Text>
        <Text className="font-regular mb-4 text-sm text-muted">
          Start tracking activities and relapses to see your engagement rate.
        </Text>
        <View className="items-center justify-center py-8">
          <Text className="font-regular text-faint">No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={cardShadow} className="p-5 mb-4 bg-surface border border-border rounded-[20px]">
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1">
          <Text className="text-lg font-bold text-fg">Engagement Ratio</Text>
          <Text className="font-regular mt-1 text-sm text-muted">
            Your engagement rate: positive activities vs relapses.
          </Text>
        </View>
        <Pressable
          onPress={() => setShowInfo(!showInfo)}
          className="items-center justify-center w-8 h-8 ml-2 bg-subtle rounded-full active:bg-border"
        >
          {showInfo ? (
            <X size={16} color={colors.muted} />
          ) : (
            <Info size={16} color={colors.muted} strokeWidth={2.5} />
          )}
        </Pressable>
      </View>

      {/* Info Card */}
      {showInfo && (
        <InsightCallout icon={Info} className="mt-3">
          This shows your balance between positive activities and relapses. A 70%+ activity rate shows strong engagement. Focus on logging more growth activities to shift the balance!
        </InsightCallout>
      )}

      {/* Ring on the left, legend on the right side of the card */}
      <View className="flex-row items-center justify-between pt-5 pb-1 pl-1 pr-3">
        <DonutRing
          trackColor={colors.subtle}
          segments={[
            { value: activityCount, color: colors.primary },
            { value: relapseCount, color: colors.relapse },
          ]}
        >
          <Text className="text-3xl font-bold text-fg">{activityPercentage}%</Text>
          <Text className="text-sm font-semibold text-muted">activity rate</Text>
        </DonutRing>

        <View className="gap-5">
          <View>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              <Text className="text-sm font-semibold text-muted">Activities</Text>
            </View>
            <Text className="ml-[18px] text-2xl font-bold text-fg">
              {activityCount} <Text className="text-sm font-semibold text-muted">({activityPercentage}%)</Text>
            </Text>
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-relapse" />
              <Text className="text-sm font-semibold text-muted">Relapses</Text>
            </View>
            <Text className="ml-[18px] text-2xl font-bold text-fg">
              {relapseCount} <Text className="text-sm font-semibold text-muted">({relapsePercentage}%)</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Success Message with Research-Based Thresholds */}
      {activityPercentage >= 60 && (
        <InsightCallout
          icon={Check}
          className="mt-4"
          title={activityPercentage >= 80
            ? 'Outstanding! You’re highly engaged in positive activities.'
            : 'Excellent! You’re actively building healthy habits.'}
        >
          {activityPercentage >= 80
            ? 'Your 80%+ activity rate shows exceptional engagement. You’re actively rewiring your brain with healthy actions!'
            : 'A 60%+ activity rate shows strong commitment to positive change. Keep channeling energy into meaningful actions!'}
        </InsightCallout>
      )}
      {activityPercentage >= 40 && activityPercentage < 60 && (
        <InsightCallout icon={Check} className="mt-4" title="Healthy balance! You're actively engaging in recovery.">
          A balanced approach with regular positive activities helps recovery. Keep logging actions, each one strengthens your new identity!
        </InsightCallout>
      )}
      {activityPercentage < 40 && totalEvents > 5 && (
        <InsightCallout icon={Sparkles} accent="info" className="mt-4" title="Build momentum! Every positive action rewires your brain.">
          Focus on adding more positive activities to your day. Physical exercise, socializing, and creative pursuits all help recovery by replacing old patterns with new, healthy ones.
        </InsightCallout>
      )}
    </View>
  );
}
