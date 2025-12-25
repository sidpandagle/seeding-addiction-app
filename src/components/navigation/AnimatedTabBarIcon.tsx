import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';

interface AnimatedTabBarIconProps {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  size?: number;
}

export function AnimatedTabBarIcon({
  Icon,
  color,
  focused,
  size = 24,
}: AnimatedTabBarIconProps) {
  const scale = useSharedValue(focused ? 1 : 0.9);

  useEffect(() => {
    if (focused) {
      // Bounce animation on focus
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 300 }), // Overshoot
        withSpring(1, { damping: 12, stiffness: 300 }) // Settle
      );
    } else {
      // Smooth scale down when unfocused
      scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    }
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        size={size}
        color={color}
        strokeWidth={focused ? 2.5 : 2}
      />
    </Animated.View>
  );
}
