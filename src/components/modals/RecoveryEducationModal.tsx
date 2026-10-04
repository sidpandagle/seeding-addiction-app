import type { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Brain, TrendingUp, Zap, Info, Sprout, Smartphone, type LucideIcon } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { SheetHeader } from '../common/SheetHeader';

interface RecoveryEducationModalProps {
  onClose: () => void;
}

/** One topic: sage icon circle, title, then its paragraphs and boxes */
function Topic({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  return (
    <View style={cardShadow} className="mb-4 rounded-[20px]">
      <View className="p-5 border bg-surface border-border rounded-[20px]">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
            <Icon size={20} color={colors.primary} strokeWidth={2.25} />
          </View>
          <Text className="flex-1 text-xl font-bold text-fg">{title}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

/** Grey side note with a small icon */
function Note({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-start gap-2.5 px-3.5 py-3 mt-3 rounded-2xl bg-subtle">
      <View className="mt-0.5">
        <Icon size={17} color={colors.muted} strokeWidth={2.5} />
      </View>
      <Text className="font-regular flex-1 text-sm text-body">{children}</Text>
    </View>
  );
}

export default function RecoveryEducationModal({
  onClose,
}: Readonly<RecoveryEducationModalProps>) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SheetHeader title="Understanding recovery" subtitle="Science-based insights for your journey" onClose={onClose} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pt-2 pb-10">
        <Topic icon={TrendingUp} title="Why frequency matters">
          <Text className="font-regular text-base leading-6 text-body">
            Okay, real talk: recovery isn't about being perfect forever. It's about{' '}
            <Text className="font-bold text-fg">stretching the time between slips</Text>. If you go from
            “this happens a lot” to “this happens way less,” that's your brain learning. That's progress.
          </Text>
          <Note icon={Info}>
            <Text className="font-bold text-fg">Quick reality check: </Text>
            relapse can be part of the recovery process. NIH/NIDA often describes relapse rates for substance
            use disorders around <Text className="font-bold text-fg">40–60%</Text>, which is in the same
            ballpark as other chronic conditions when people stop following the plan. A slip isn't “I'm
            broken.” It's a signal to adjust your strategy.
          </Note>
        </Topic>

        <Topic icon={Zap} title="Cheap vs. natural dopamine">
          <Text className="font-regular text-base leading-6 text-body">
            Dopamine isn't just a “pleasure chemical.” It's more like your brain's{' '}
            <Text className="font-regular italic">learning</Text> signal: “Yo, that mattered, remember it and do it again.”
            The problem is some rewards hit like a microphone in your ear.
          </Text>

          {/* Two kinds, told apart by a small icon and label color */}
          <View className="gap-3 mt-4">
            <View className="p-4 rounded-2xl bg-subtle">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Smartphone size={17} color={colors.urge} strokeWidth={2.5} />
                <Text className="text-base font-bold text-urge">Cheap dopamine</Text>
              </View>
              <Text className="mb-1.5 text-xs font-bold tracking-wide uppercase text-muted">Fast, intense, low-effort</Text>
              <Text className="font-regular text-sm text-body">
                Think: endless scrolling, junk food, porn, binge gaming, anything that's high reward with
                almost no effort. Your brain learns the shortcut, starts craving it, and normal life can feel
                kind of “meh” for a while.
              </Text>
            </View>
            <View className="p-4 rounded-2xl bg-subtle">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Sprout size={17} color={colors.primary} strokeWidth={2.5} />
                <Text className="text-base font-bold text-primary-ink">Natural dopamine</Text>
              </View>
              <Text className="mb-1.5 text-xs font-bold tracking-wide uppercase text-muted">Earned rewards</Text>
              <Text className="font-regular text-sm text-body">
                Exercise, learning, meaningful work, real conversations, stuff that takes effort. It's not
                always “fun” in the moment, but it builds real satisfaction and helps your brain re-learn that
                normal rewards are actually rewarding.
              </Text>
            </View>
          </View>
        </Topic>

        <Topic icon={Brain} title="Your brain can heal">
          <Text className="font-regular text-base leading-6 text-body">
            Here's the hopeful part: your brain is insanely adaptable. With time and repetition,{' '}
            <Text className="font-bold text-fg">the reward system can recover</Text>, and the cravings can
            lose their grip. Not overnight, but over weeks and months, things usually get noticeably easier.
          </Text>
          <Note icon={Brain}>
            <Text className="font-bold text-fg">The key idea: </Text>
            cravings are often triggered by stress and cues (people, places, moods, routines). Every time you
            notice the urge and ride it out, you're training your brain: “We don't do that anymore.” That's
            literally how new habits replace old ones.
          </Note>
        </Topic>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          className="items-center py-4 mt-3 rounded-2xl bg-primary active:bg-primary-ink"
        >
          <Text className="text-lg font-bold text-primary-on">Got it</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
