import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GrowthStage, GROWTH_STAGES } from '../utils/growthStages';
import { useThemeStore } from '../stores/themeStore';

interface GrowthIconProps {
  stage: GrowthStage;
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  onStageChange?: (newStage: GrowthStage) => void;
}

export default function GrowthIcon({
  stage,
  size = 80,
  animated = true,
  glowing = false,
  onStageChange,
}: GrowthIconProps) {
  const theme = useThemeStore((state:any) => state.theme);
  const isDark = theme === 'dark';
  const stageConfig = GROWTH_STAGES.find((s) => s.id === stage) || GROWTH_STAGES[0];

  // Trigger callback on stage change
  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage);
    }
  }, [stage, onStageChange]);

  const iconContent = (
    <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{stageConfig.emoji}</Text>
  );

  // Apply glow effect in dark mode or when explicitly enabled
  if ((isDark || glowing) && animated) {
    return (
      <View className="relative items-center justify-center">
        {/* Glow effect using LinearGradient */}
        <View className="absolute" style={{ width: size * 1.5, height: size * 1.5 }}>
          <LinearGradient
            colors={[stageConfig.color + '40', 'transparent']}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: size * 0.75,
            }}
          />
        </View>
        {iconContent}
      </View>
    );
  }

  return <View className="items-center justify-center">{iconContent}</View>;
}
