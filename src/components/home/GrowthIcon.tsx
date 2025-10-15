import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GrowthStage, GROWTH_STAGES } from '../../utils/growthStages';
import { useColorScheme } from '../../stores/themeStore';

interface GrowthIconProps {
  stage: GrowthStage;
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  onStageChange?: (newStage: GrowthStage) => void;
}

// Phase 2 Optimization: Memoize component to prevent unnecessary re-renders
const GrowthIcon = React.memo(function GrowthIcon({
  stage,
  size = 80,
  animated = true,
  glowing = false,
  onStageChange,
}: GrowthIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const stageConfig = GROWTH_STAGES.find((s) => s.id === stage) || GROWTH_STAGES[0];

  // Phase 2 Optimization: Track previous stage to prevent cascading updates
  // Only call onStageChange when stage actually changes, not on every render
  const prevStageRef = useRef<GrowthStage>(stage);

  useEffect(() => {
    if (prevStageRef.current !== stage && onStageChange) {
      onStageChange(stage);
      prevStageRef.current = stage;
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
});

export default GrowthIcon;
