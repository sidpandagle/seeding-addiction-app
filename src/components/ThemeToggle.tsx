import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useEffect } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);
  const rotation = useSharedValue(isDark ? 180 : 0);

  useEffect(() => {
    rotation.value = withSpring(isDark ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    toggleColorScheme();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center border border-gray-300 dark:border-gray-700"
    >
      <Ionicons
        name={isDark ? 'moon' : 'sunny'}
        size={24}
        color={isDark ? '#FCD34D' : '#F59E0B'}
      />
    </AnimatedPressable>
  );
}
