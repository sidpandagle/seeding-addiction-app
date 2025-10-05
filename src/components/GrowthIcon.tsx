import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
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
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const stageConfig = GROWTH_STAGES.find((s) => s.id === stage) || GROWTH_STAGES[0];

  // Trigger callback on stage change
  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage);
    }
  }, [stage, onStageChange]);

  const iconContent = (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 100,
      }}
      key={stage} // Re-mount on stage change to trigger animation
    >
      <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{stageConfig.emoji}</Text>
    </MotiView>
  );

  // Apply glow effect in dark mode or when explicitly enabled
  if ((isDark || glowing) && animated) {
    return (
      <MotiView
        from={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
        }}
      >
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
      </MotiView>
    );
  }

  return <View className="items-center justify-center">{iconContent}</View>;
}
