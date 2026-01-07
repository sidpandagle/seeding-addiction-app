import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { Brain, TrendingUp, Zap, X } from 'lucide-react-native';

interface RecoveryEducationModalProps {
  onClose: () => void;
}

export default function RecoveryEducationModal({
  onClose,
}: Readonly<RecoveryEducationModalProps>) {
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
              Okay, real talk: recovery isn't about being perfect forever. It's about{' '}
              <Text className="font-bold text-emerald-600 dark:text-emerald-400">
                stretching the time between slips
              </Text>
              . If you go from “this happens a lot” to “this happens way less,” that's your brain
              learning. That's progress.
            </Text>
            <View className="p-4 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 rounded-2xl">
              <Text className="text-base font-semibold leading-6 text-emerald-700 dark:text-emerald-300">
                <Text className="font-bold">Quick reality check:</Text> relapse can be part of the
                recovery process. NIH/NIDA often describes relapse rates for substance use disorders
                around <Text className="font-bold">40–60%</Text>, which is in the same ballpark as
                other chronic conditions when people stop following the plan. A slip isn't “I'm
                broken.” It's a signal to adjust your strategy.
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
              Dopamine isn't just a “pleasure chemical.” It's more like your brain's{' '}
              <Text className="italic">learning</Text> signal: “Yo, that mattered,remember it and do
              it again.” The problem is some rewards hit like a microphone in your ear.
            </Text>

            {/* Cheap Dopamine */}
            <View className="p-4 mb-4 border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700 rounded-2xl">
              <Text className="mb-2 text-base font-bold text-red-700 dark:text-red-300">
                Cheap Dopamine (fast, intense, low-effort)
              </Text>
              <Text className="text-base leading-6 text-red-600 dark:text-red-400">
                Think: endless scrolling, junk food, porn, binge gaming,anything that's high reward
                with almost no effort. Your brain learns the shortcut, starts craving it, and normal
                life can feel kind of “meh” for a while.
              </Text>
            </View>

            {/* Natural Dopamine */}
            <View className="p-4 border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700 rounded-2xl">
              <Text className="mb-2 text-base font-bold text-blue-700 dark:text-blue-300">
                Natural Dopamine (earned rewards)
              </Text>
              <Text className="text-base leading-6 text-blue-600 dark:text-blue-400">
                Exercise, learning, meaningful work, real conversations,stuff that takes effort.
                It's not always “fun” in the moment, but it builds real satisfaction and helps your
                brain re-learn that normal rewards are actually rewarding.
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
              Here's the hopeful part: your brain is insanely adaptable. With time and repetition,
              <Text className="font-bold text-purple-600 dark:text-purple-400">
                the reward system can recover
              </Text>
              , and the cravings can lose their grip. Not overnight,but over weeks and months,
              things usually get noticeably easier.
            </Text>
            <View className="p-4 border border-purple-300 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-700 rounded-2xl">
              <Text className="text-base leading-6 text-purple-700 dark:text-purple-300">
                <Text className="font-bold">The key idea:</Text> cravings are often triggered by
                stress and cues (people, places, moods, routines). Every time you notice the urge
                and ride it out, you're training your brain: “We don't do that anymore.” That's
                literally how new habits replace old ones.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
