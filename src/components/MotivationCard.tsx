import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import motivationalQuotes from '../data/motivationalQuotes.json';

export const MotivationCard: React.FC = () => {
  const isDark = useThemeStore((state:any) => state.isDark);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [])

  return (
    <View className="relative p-5 mx-4 mb-6 border rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
      <View className="flex-row items-center mb-2">
        <Text className="mr-2 text-2xl">🌱</Text>
        <Text className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
          Daily Reflection
        </Text>
      </View>

      <View>
        <Animated.Text
          key={currentIndex}
          entering={FadeInRight.duration(600).springify()}
          exiting={FadeOutLeft.duration(600)}
          className="text-base font-regular italic leading-6 text-gray-700 dark:text-gray-300"
        >
          "{motivationalQuotes[currentIndex].text}"
        </Animated.Text>
      </View>

      {/* Decorative elements */}
      <View className="absolute flex-row gap-1 bottom-2 right-3">
        <Text className="text-xs opacity-30">🌿</Text>
      </View>
    </View>
  );
};
