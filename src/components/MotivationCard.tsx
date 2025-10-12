import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import motivationalQuotes from '../data/motivationalQuotes.json';

export const MotivationCard: React.FC = () => {
  const colorScheme = useThemeStore((state:any) => state.colorScheme);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 12000); // Change every 12 seconds

    return () => clearInterval(interval);
  }, [])

  const isDark = colorScheme === 'dark';

  return (
    <View className="mx-6 mb-8 p-6 bg-white dark:bg-[#252336] rounded-2xl">
      <View className="flex-row items-center mb-3">
        <Text className="mr-2 text-xl">�</Text>
        <Text className="text-sm font-semibold text-primary-700 dark:text-primary-300 tracking-wide">
          Daily Reflection
        </Text>
      </View>

      <View>
        <Animated.Text
          key={currentIndex}
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(600)}
          className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 italic"
        >
          "{motivationalQuotes[currentIndex].text}"
        </Animated.Text>
      </View>

      {/* Subtle decorative element */}
      <View className="absolute bottom-4 right-4 opacity-10">
        <Text className="text-2xl">✨</Text>
      </View>
    </View>
  );
};
