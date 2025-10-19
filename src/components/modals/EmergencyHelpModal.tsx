import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { getRandomTeaching, type StoicTeaching } from '../../data/stoicTeachings';
import { X, RefreshCw, Brain } from 'lucide-react-native';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());

  const handleNewQuote = () => {
    setCurrentTeaching(getRandomTeaching());
  };

  const getCategoryColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'discipline':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
      case 'resilience':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'wisdom':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
      case 'virtue':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
    }
  };

  const getCategoryTextColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'text-blue-700 dark:text-blue-300';
      case 'discipline':
        return 'text-purple-700 dark:text-purple-300';
      case 'resilience':
        return 'text-amber-700 dark:text-amber-300';
      case 'wisdom':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'virtue':
        return 'text-rose-700 dark:text-rose-300';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Modern Header */}
        <View className="px-6 pt-16 pb-6 bg-rose-50 dark:bg-gray-900">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">You've Got This</Text>
              <Text className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                This urge will pass. You are stronger.
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

        {/* Stoic Teaching */}
        <View className="px-5 py-6">
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Brain size={24} color="#059669" strokeWidth={2} />
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Stoic Wisdom</Text>
              </View>
              <Pressable
                onPress={handleNewQuote}
                className="flex-row items-center gap-2 px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl dark:bg-gray-800 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
              >
                <RefreshCw size={16} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">New</Text>
              </Pressable>
            </View>

            {/* Quote Card */}
            <View
              className={`p-5 border-2 rounded-xl ${getCategoryColor(currentTeaching.category)}`}
            >
              <Text className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                {currentTeaching.category}
              </Text>
              <Text className={`text-lg font-bold leading-7 mb-3 ${getCategoryTextColor(currentTeaching.category)}`}>
                "{currentTeaching.quote}"
              </Text>
              <Text className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                — {currentTeaching.author}
              </Text>
              <View className="pt-3 border-t border-gray-300 dark:border-gray-600">
                <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {currentTeaching.explanation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 pb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Take Action Now</Text>
          <View className="gap-3">
            <View className="p-5 border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">💪 Physical Reset</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Do 10 push-ups, take a cold shower, go for a walk, or sprint like you're being chased by a really slow zombie. Your body needs to remember who's boss.
              </Text>
            </View>
            <View className="p-5 border bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🧘 Mental Distraction</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Call a friend (yes, actual voice), work on that hobby you keep postponing, watch a documentary about something ridiculously specific, or meditate (even if you're bad at it—we all are).
              </Text>
            </View>
            <View className="p-5 border bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🎯 Remember Your Why</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Think about your goals. Why did you start this journey? What's at stake? You've come too far to quit now. Future you is rooting for present you.
              </Text>
            </View>
            <View className="p-5 border bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🎮 Redirect the Energy</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Play a quick game, clean your room (yes, really), organize your desk, or learn 5 words in a new language. Channel that chaos into something productive—or at least mildly entertaining.
              </Text>
            </View>
            <View className="p-5 border bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🍎 Fuel Your Brain</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Drink a full glass of water, eat an apple, have some nuts, or make yourself a proper snack. Sometimes your brain is just hangry. Don't negotiate with a hungry brain.
              </Text>
            </View>
            <View className="p-5 border bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🌬️ Breathe, Seriously</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Breathe in for 4, hold for 4, out for 4. Repeat 5 times. It sounds too simple to work, but your nervous system doesn't know that. Trick it into calming down.
              </Text>
            </View>
            <View className="p-5 border bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">📝 Write It Out</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Journal about how you feel right now. Write angry. Write grateful. Write confused. Just get it out of your head and onto paper. Your brain will thank you for the eviction notice.
              </Text>
            </View>
            <View className="p-5 border bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800 rounded-xl">
              <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">🎵 Change the Soundtrack</Text>
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                Put on your favorite pump-up song and dance like nobody's watching (because they're not). Music changes moods faster than you think. Make it loud. Make it ridiculous. Make it yours.
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View className="px-5 pb-12">
          <View className="p-6 bg-white border border-gray-200 border-dashed dark:bg-gray-900 dark:border-gray-700 rounded-2xl">
            <Text className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              This feeling is temporary
            </Text>
            <Text className="text-base leading-6 text-center text-gray-700 dark:text-gray-300">
              Urges typically last 15-20 minutes. You can outlast this. Stay strong. We believe in you.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
