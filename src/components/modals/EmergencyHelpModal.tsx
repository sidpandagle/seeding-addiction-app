import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { useRelapseStore } from '../../stores/relapseStore';
import {
  TAPE_FORWARD,
  PHYSICAL_SHOCK_ACTIONS,
} from '../../data/educationalContent';
import { X } from 'lucide-react-native';

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const relapses = useRelapseStore((state) => state.relapses);

  // Random selections - initialized once on modal open
  const [randomGiveIn] = useState(() => getRandomItems(TAPE_FORWARD.giveIn, 4));
  const [randomResist] = useState(() => getRandomItems(TAPE_FORWARD.resist, 4));
  const [randomShockActions] = useState(() => getRandomItems(PHYSICAL_SHOCK_ACTIONS, 6));

  // Calculate current streak (days since last relapse)
  const streakDays = useMemo(() => {
    if (relapses.length === 0) {
      return 0;
    }

    const lastRelapseTime = new Date(relapses[relapses.length - 1].timestamp).getTime();
    const now = new Date().getTime();
    const daysPassed = Math.floor((now - lastRelapseTime) / (1000 * 60 * 60 * 24));
    return daysPassed;
  }, [relapses]);

  // Dynamic plant emoji based on streak progress - with impactful messages
  const getPlantStage = (days: number) => {
    if (days >= 90) return {
      emoji: '🌳',
      label: 'Mighty Oak',
      message: "You've proven you can do this. 90+ days of rewiring. You're not fighting urges anymore — you're defeating a weakened enemy."
    };
    if (days >= 30) return {
      emoji: '🌿',
      label: 'Thriving',
      message: "A month of healing. Your brain is physically changing. The neural pathways of addiction are weakening. Don't rebuild them now."
    };
    if (days >= 7) return {
      emoji: '🪴',
      label: 'Growing Strong',
      message: "Your roots are spreading. Each day they grow deeper. One moment of weakness destroys weeks of growth."
    };
    return {
      emoji: '🌱',
      label: 'Seedling',
      message: "The hardest part is starting. You already did that. Don't uproot what you just planted."
    };
  };

  // Rotating dynamic messages for streak display
  const getStreakMessage = (days: number): string => {
    const messages = [
      `${days} days of your life invested in healing. Is a few seconds of pleasure worth throwing that away?`,
      `${days} days. That's ${days} nights of peaceful sleep. ${days} mornings of clarity. Gone in one moment.`,
      `Your brain has been healing for ${days} days. One relapse and you're not back to day 1 — you're back to day negative.`,
      `${days} days of proof that you're stronger than the urge. Don't let the urge win today.`,
    ];
    // Use current hour to rotate messages (changes every hour)
    const hourIndex = new Date().getHours() % messages.length;
    return messages[hourIndex];
  };

  const plantStage = getPlantStage(streakDays);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Header - Empathetic acknowledgment */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                This is hard.
              </Text>
              <Text className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                But you've felt this before and survived. You'll survive this too.
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

        {/* SECTION: Reality Check - Plant/Streak */}
        <View className="px-5 pb-5">
          <View className="p-5 border bg-emerald-100 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700 rounded-xl">
            <View className="items-center mb-4">
              <Text className="mb-3 text-8xl">{plantStage.emoji}</Text>
              {streakDays > 0 && (
                <Text className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {streakDays} {streakDays === 1 ? 'day' : 'days'} of growth
                </Text>
              )}
            </View>
            <Text className="mb-3 text-lg font-semibold leading-6 text-center text-emerald-900 dark:text-emerald-100">
              {streakDays > 0
                ? getStreakMessage(streakDays)
                : "You've started your journey. Don't reset the progress you're making right now."}
            </Text>
            <Text className="text-sm text-center text-emerald-800 dark:text-emerald-200">
              {plantStage.message}
            </Text>
          </View>
        </View>

        

        {/* SECTION 2: Play the Tape Forward */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
            Fast Forward 30 Minutes
          </Text>
          <View className="flex-row gap-3">
            {/* Give In Column */}
            <View className="flex-1 p-4 bg-red-100 border border-red-100 dark:bg-red-950/30 dark:border-red-700 rounded-xl">
              <Text className="mb-3 text-sm font-bold text-center text-red-700 dark:text-red-400">
                If you give in:
              </Text>
              {randomGiveIn.map((item, index) => (
                <Text key={index} className="mb-1.5 text-sm text-justify text-red-700 dark:text-red-300">
                  - {item}
                </Text>
              ))}
            </View>
            {/* Resist Column */}
            <View className="flex-1 p-4 border bg-emerald-100 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700 rounded-xl">
              <Text className="mb-3 text-sm font-bold text-center text-emerald-800 dark:text-emerald-200">
                If you resist:
              </Text>
              {randomResist.map((item, index) => (
                <Text key={index} className="text-sm text-emerald-700 dark:text-emerald-300">
                  - {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 4: Physical Shock Actions */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
            Shock Your System — Pick One Now
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {randomShockActions.map((action, index) => (
              <View
                key={index}
                className="flex-row items-center px-3 py-2.5 border bg-indigo-100 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-700 rounded-lg"
                style={{ width: '48%' }}
              >
                <Text className="mr-2 text-lg">{action.icon}</Text>
                <Text className="flex-1 text-xs font-medium text-indigo-900 dark:text-white">
                  {action.action}
                </Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-xs text-center text-gray-500 dark:text-gray-500">
            Physical discomfort interrupts the craving circuit.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="pb-12" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
