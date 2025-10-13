import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import motivationalQuotes from '../data/motivationalQuotes.json';

export const MotivationCard: React.FC = () => {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="px-6 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Daily Inspiration
        </Text>
        <Text className="text-2xl">✨</Text>
      </View>

      {/* Card with Background Icon */}
      <View className="relative overflow-hidden bg-white border-2 border-emerald-200 dark:border-emerald-800/50 dark:bg-gray-900 rounded-2xl">
        <View className="p-6">
          {/* Decorative Background Icon - Bottom Right */}
          <View className="absolute bottom-[-20px] right-[-20px] opacity-10 dark:opacity-5">
            <Text className="text-[140px]">🌱</Text>
          </View>

          {/* Quote Content */}
          <View className="relative">
            <Animated.Text
              key={currentIndex}
              entering={SlideInRight.duration(600).springify()}
              exiting={SlideOutLeft.duration(400)}
              className="text-lg leading-7 font-medium text-gray-700 dark:text-gray-300 min-h-[84px]"
            >
              {motivationalQuotes[currentIndex].text}
            </Animated.Text>
          </View>

          {/* Category Tag */}
          <View className="flex-row items-center justify-between mt-4">
            <View className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
              <Text className="text-xs font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                {motivationalQuotes[currentIndex].category}
              </Text>
            </View>
            
            {/* Progress Dots */}
            <View className="flex-row gap-1.5">
              {[...Array(Math.min(5, motivationalQuotes.length))].map((_, index) => (
                <View
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentIndex % 5
                      ? 'bg-emerald-600 dark:bg-emerald-400 w-4'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
