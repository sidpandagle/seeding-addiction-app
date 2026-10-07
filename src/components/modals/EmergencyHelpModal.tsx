import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { useActivityStore } from '../../stores/activityStore';
import { useToastStore } from '../../stores/toastStore';
import { RideTheWave } from '../home/RideTheWave';
import {
  TAPE_FORWARD,
  PHYSICAL_SHOCK_ACTIONS,
} from '../../data/educationalContent';
import { X, CircleX, CircleCheck } from 'lucide-react-native';

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
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const addActivity = useActivityStore((state) => state.addActivity);
  const showToast = useToastStore((state) => state.showToast);

  // Random selections - initialized once on modal open
  const [randomGiveIn] = useState(() => getRandomItems(TAPE_FORWARD.giveIn, 4));
  const [randomResist] = useState(() => getRandomItems(TAPE_FORWARD.resist, 4));
  const [randomShockActions] = useState(() => getRandomItems(PHYSICAL_SHOCK_ACTIONS, 6));
  const [randomAffirmation] = useState(() =>
    POWER_AFFIRMATIONS[Math.floor(Math.random() * POWER_AFFIRMATIONS.length)]
  );

  // Finishing the urge timer can be saved as a win
  const handleLogWaveWin = async (minutes: number) => {
    try {
      await addActivity({ categories: ['🧘 Mindfulness'], note: `Rode out an urge with the ${minutes}-minute timer` });
      showToast('✨ Win logged');
    } catch (error) {
      showToast("Couldn't log the win. Try again.");
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      <ScrollView className="flex-1">
        {/* Header - Empathetic acknowledgment */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-fg">
                This is hard.
              </Text>
              <Text className="text-sm font-medium text-primary-ink">
                But you've felt this before and survived. You'll survive this too.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="items-center justify-center w-12 h-12 bg-surface rounded-2xl active:bg-bg"
              accessibilityLabel="Close"
              accessibilityHint="Closes the emergency help modal"
              accessibilityRole="button"
            >
              <X size={20} color={colors.fg} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {/* SECTION: Ride the wave - 10-minute urge timer */}
        <View className="px-5 pb-5">
          <RideTheWave onLogWin={handleLogWaveWin} />
        </View>

        {/* SECTION: Reality Check - Power Affirmation */}
        <View className="px-5 pb-5">
          {/* Soft sage card with a faint quote mark in the corner */}
          <View className="relative p-5 overflow-hidden bg-primary-soft rounded-xl">
            <Text
              className="absolute font-bold -bottom-12 right-2 opacity-10"
              style={{ fontSize: 120, lineHeight: 120, color: colors.primary }}
              accessible={false}
            >
              ”
            </Text>
            <Text className="text-xl font-bold leading-7 text-center text-primary-ink">
              {randomAffirmation}
            </Text>
          </View>
        </View>

        

        {/* SECTION 2: Play the Tape Forward */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
            Fast Forward 30 Minutes
          </Text>
          <View className="flex-row gap-3">
            {/* Give In Column */}
            <View style={cardShadow} className="flex-1 p-4 border bg-surface border-border rounded-2xl">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <CircleX size={16} color={colors.urge} strokeWidth={2.5} />
                <Text className="text-sm font-bold text-urge">If you give in</Text>
              </View>
              {randomGiveIn.map((item, index) => (
                <View key={`givein-${index}-${item.slice(0, 15)}`} className="flex-row items-start gap-2 mb-1.5">
                  <View className="w-1.5 h-1.5 mt-2 rounded-full bg-urge" />
                  <Text className="font-regular flex-1 text-sm text-body">{item}</Text>
                </View>
              ))}
            </View>
            {/* Resist Column */}
            <View style={cardShadow} className="flex-1 p-4 border bg-surface border-border rounded-2xl">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <CircleCheck size={16} color={colors.primary} strokeWidth={2.5} />
                <Text className="text-sm font-bold text-primary-ink">If you resist</Text>
              </View>
              {randomResist.map((item, index) => (
                <View key={`resist-${index}-${item.slice(0, 15)}`} className="flex-row items-start gap-2 mb-1.5">
                  <View className="w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
                  <Text className="font-regular flex-1 text-sm text-body">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 4: Physical Shock Actions */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
            Shock Your System, Pick One Now
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {randomShockActions.map((action, index) => (
              <View
                key={`shock-${index}-${action.action.slice(0, 10)}`}
                className="relative px-3.5 py-3 overflow-hidden border bg-surface border-border rounded-2xl min-h-[72px]"
                style={[cardShadow, { width: '48%' }]}
              >
                {/* Emoji as a faint corner mark, so the text gets the full width */}
                <Text className="font-regular absolute text-4xl -bottom-2 -right-1 opacity-20" accessible={false}>
                  {action.icon}
                </Text>
                <Text className="text-sm font-semibold text-fg">
                  {action.action}
                </Text>
              </View>
            ))}
          </View>
          <Text className="font-regular mt-3 text-sm text-center text-muted">
            Physical discomfort interrupts the craving circuit.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="pb-12" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
