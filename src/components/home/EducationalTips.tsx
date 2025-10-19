import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Brain, TrendingUp, Zap } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

/**
 * Educational tips component explaining dopamine science and recovery thresholds
 * Displayed on home screen to provide proactive education
 */
const EducationalTipsComponent: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <View className="px-6 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Brain size={20} color="#a855f7" strokeWidth={2.5} />
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Understanding Your Journey
          </Text>
        </View>
      </View>

      {/* Content */}
      <View
        // style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' }}
        // className="border border-gray-200 shadow-sm dark:border-gray-800 rounded-2xl"
      >
        {/* Why Relapse Frequency Matters */}
        <View className="p-0 ">
          <View className="flex-row items-center gap-2 mb-3">
            <TrendingUp size={20} color="#10b981" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Why Frequency Matters
            </Text>
          </View>
          <Text className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Recovery isn't about perfection—it's about <Text className="font-bold text-emerald-600 dark:text-emerald-400">increasing time between relapses</Text>. Research shows that going from weekly relapses to monthly ones is massive progress, even if you're not perfect.
          </Text>
          <View className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Text className="font-bold">What's Acceptable?</Text> A 40-60% success rate is normal in addiction recovery. After 5 years, successful recoveries see this improve to 85%. Progress over time is what counts.
            </Text>
          </View>
        </View>

        {/* Cheap vs. Natural Dopamine */}
        <View className="py-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Zap size={20} color="#f59e0b" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Cheap vs. Natural Dopamine
            </Text>
          </View>
          <Text className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Your brain releases dopamine for <Text className="italic">all</Text> rewards, but there's a crucial difference:
          </Text>

          {/* Cheap Dopamine */}
          <View className="p-3 mb-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <Text className="mb-1 text-sm font-bold text-red-700 dark:text-red-300">
              Cheap Dopamine (50-100% spike)
            </Text>
            <Text className="text-xs leading-5 text-red-600 dark:text-red-400">
              Social media, junk food, addictive behaviors. High reward, zero effort. Your brain gets desensitized, needing more stimulation for the same feeling. This creates a cycle of craving and dissatisfaction.
            </Text>
          </View>

          {/* Natural Dopamine */}
          <View className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <Text className="mb-1 text-sm font-bold text-blue-700 dark:text-blue-300">
              Natural Dopamine (earned rewards)
            </Text>
            <Text className="text-xs leading-5 text-blue-600 dark:text-blue-400">
              Exercise, learning, meaningful work, real conversations. These require effort but build lasting satisfaction. Your brain stays sensitive to rewards and you feel genuinely fulfilled.
            </Text>
          </View>
        </View>

        {/* Recovery Science */}
        <View className="py-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Brain size={20} color="#a855f7" strokeWidth={2.5} />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Your Brain Can Heal
            </Text>
          </View>
          <Text className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Here's the good news: <Text className="font-bold text-purple-600 dark:text-purple-400">Your brain's reward system recovers</Text>. Studies show cravings decrease significantly within 4 weeks of reducing cheap dopamine sources.
          </Text>
          <View className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
            <Text className="text-xs leading-5 text-purple-700 dark:text-purple-300">
              <Text className="font-bold">The Timeline:</Text> Most people see 85% relapse rate in year 1, dropping to 40% by year 2, and just 15% by year 5. Each urge you resist rewires your brain to prefer natural rewards. You're literally rebuilding your dopamine sensitivity.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Export memoized version
export const EducationalTips = memo(EducationalTipsComponent);
