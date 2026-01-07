import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { useRelapseStore } from '../../stores/relapseStore';
import {
  TAPE_FORWARD,
  PHYSICAL_SHOCK_ACTIONS,
} from '../../data/educationalContent';
import { X } from 'lucide-react-native';

const POWER_AFFIRMATIONS = [
  "Okay. This urge is LOUD, but it's not the boss. It's just your brain asking for the old shortcut. Breathe for 10 seconds and watch it like a notification,no need to click.",
  "Lowkey, cravings are just your brain being dramatic. You don't have to argue with it. Just don't move toward it. Stay still, stay safe, stay in control.",
  "This feeling is temporary. Urges rise, peak, and fade. Give it 10–15 minutes and it will chill out. You can do 10 minutes. Easyyyy.",
  "Having an urge doesn't mean you're failing,it means you're healing. The pattern is trying to pull you back, and you're learning a new one. Main character energy: you choose what happens next.",
  "Your brain is trying to sell you a 'quick fix.' It's giving scam. The " +
    "after-feeling is never worth it. Choose the option that future-you thanks you for.",
  "Highkey: future you is watching. 30-minutes-from-now you is gonna be proud you held the line. Hold it down for that version of you.",
  "Two voices right now: the craving voice and your real voice. The craving is loud, not wise. Pick your voice.",
  "Every time you resist, you're literally rewiring. That's a W. You're teaching your brain: 'we're not doing that anymore.' Keep stacking wins.",
  "If you slip, you reset. No shame, no spiral. But right now you're in control,lock in for 60 seconds. Then another 60. One minute at a time.",
  "Cravings come in waves. Let it pass through without acting. Do one tiny interrupt: drink water, wash your face, step outside, text someone, move your body. Break the loop.",
  "Your streak isn't just a number,it's receipts. Proof you can do hard things. Don't trade a long-term win for a short-term moment.",
  "This urge is uncomfortable, not unstoppable. You're built for discomfort. Stay grounded, stay steady, let's gooooo.",
];

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

export default function EmergencyHelpModal({
  onClose,
}: Readonly<EmergencyHelpModalProps>) {
  const colorScheme = useColorScheme();
  const relapses = useRelapseStore((state) => state.relapses);

  // Random selections - initialized once on modal open
  const [randomGiveIn] = useState(() => getRandomItems(TAPE_FORWARD.giveIn, 4));
  const [randomResist] = useState(() => getRandomItems(TAPE_FORWARD.resist, 4));
  const [randomShockActions] = useState(() => getRandomItems(PHYSICAL_SHOCK_ACTIONS, 6));
  const [randomAffirmation] = useState(() =>
    POWER_AFFIRMATIONS[Math.floor(Math.random() * POWER_AFFIRMATIONS.length)]
  );

  // Calculate current streak (days since last relapse)
  const streakDays = useMemo(() => {
    if (relapses.length === 0) {
      return 0;
    }

    const lastRelapse = relapses.at(-1);
    if (!lastRelapse) {
      return 0;
    }

    const lastRelapseTime = new Date(lastRelapse.timestamp).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - lastRelapseTime) / (1000 * 60 * 60 * 24));
    return daysPassed;
  }, [relapses]);

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
              accessibilityLabel="Close"
              accessibilityHint="Closes the emergency help modal"
              accessibilityRole="button"
            >
              <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {/* SECTION: Reality Check - Power Affirmation */}
        <View className="px-5 pb-5">
          <View className="relative p-5 bg-gray-900 dark:bg-gray-800 rounded-xl">
            <Text className="text-xl font-bold leading-7 text-center text-white">
              {randomAffirmation}
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
                <Text key={`givein-${index}-${item.slice(0, 15)}`} className="mb-1.5 text-sm text-red-700 dark:text-red-300">
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
                <Text key={`resist-${index}-${item.slice(0, 15)}`} className="text-sm text-emerald-700 dark:text-emerald-300">
                  - {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 4: Physical Shock Actions */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
            Shock Your System , Pick One Now
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {randomShockActions.map((action, index) => (
              <View
                key={`shock-${index}-${action.action.slice(0, 10)}`}
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
