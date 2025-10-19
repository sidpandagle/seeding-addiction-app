import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { Brain, TrendingUp, Zap, X } from 'lucide-react-native';

interface RecoveryEducationModalProps {
  onClose: () => void;
}

export default function RecoveryEducationModal({ onClose }: RecoveryEducationModalProps) {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-purple-50 dark:bg-gray-900">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
              Understanding Recovery
            </Text>
            <Text className="mt-1 text-base font-medium text-purple-700 dark:text-purple-400">
              Science-based insights for your journey
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-12 h-12 bg-white rounded-2xl dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700"
          >
            <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Why Relapse Frequency Matters */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <TrendingUp size={24} color="#10b981" strokeWidth={2.5} />
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Why Frequency Matters
              </Text>
            </View>
            <Text className="mb-4 text-base leading-7 text-gray-700 dark:text-gray-300">
              Recovery isn't about perfection—it's about{' '}
              <Text className="font-bold text-emerald-600 dark:text-emerald-400">
                increasing time between relapses
              </Text>
              . Research shows that going from weekly relapses to monthly ones is massive progress,
              even if you're not perfect.
            </Text>
            <View className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl">
              <Text className="text-base font-semibold leading-6 text-emerald-700 dark:text-emerald-300">
                <Text className="font-bold">What's Acceptable?</Text> A 40-60% success rate is normal
                in addiction recovery. After 5 years, successful recoveries see this improve to 85%.
                Progress over time is what counts.
              </Text>
            </View>
          </View>

          {/* Cheap vs. Natural Dopamine */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Zap size={24} color="#f59e0b" strokeWidth={2.5} />
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Cheap vs. Natural Dopamine
              </Text>
            </View>
            <Text className="mb-4 text-base leading-7 text-gray-700 dark:text-gray-300">
              Your brain releases dopamine for <Text className="italic">all</Text> rewards, but
              there's a crucial difference:
            </Text>

            {/* Cheap Dopamine */}
            <View className="p-4 mb-4 bg-red-50 dark:bg-red-950/30 rounded-2xl">
              <Text className="mb-2 text-base font-bold text-red-700 dark:text-red-300">
                Cheap Dopamine (50-100% spike)
              </Text>
              <Text className="text-base leading-6 text-red-600 dark:text-red-400">
                Social media, junk food, addictive behaviors. High reward, zero effort. Your brain
                gets desensitized, needing more stimulation for the same feeling. This creates a
                cycle of craving and dissatisfaction.
              </Text>
            </View>

            {/* Natural Dopamine */}
            <View className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
              <Text className="mb-2 text-base font-bold text-blue-700 dark:text-blue-300">
                Natural Dopamine (earned rewards)
              </Text>
              <Text className="text-base leading-6 text-blue-600 dark:text-blue-400">
                Exercise, learning, meaningful work, real conversations. These require effort but
                build lasting satisfaction. Your brain stays sensitive to rewards and you feel
                genuinely fulfilled.
              </Text>
            </View>
          </View>

          {/* Recovery Science */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Brain size={24} color="#a855f7" strokeWidth={2.5} />
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Your Brain Can Heal
              </Text>
            </View>
            <Text className="mb-4 text-base leading-7 text-gray-700 dark:text-gray-300">
              Here's the good news:{' '}
              <Text className="font-bold text-purple-600 dark:text-purple-400">
                Your brain's reward system recovers
              </Text>
              . Studies show cravings decrease significantly within 4 weeks of reducing cheap
              dopamine sources.
            </Text>
            <View className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl">
              <Text className="text-base leading-6 text-purple-700 dark:text-purple-300">
                <Text className="font-bold">The Timeline:</Text> Most people see 85% relapse rate in
                year 1, dropping to 40% by year 2, and just 15% by year 5. Each urge you resist
                rewires your brain to prefer natural rewards. You're literally rebuilding your
                dopamine sensitivity.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
