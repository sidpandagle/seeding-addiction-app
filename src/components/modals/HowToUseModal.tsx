import { View, Text, ScrollView, Pressable } from 'react-native';
import { Sprout, Activity, BarChart3, Settings, Lock, TrendingUp, Info, Lightbulb, type LucideIcon } from 'lucide-react-native';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { SheetHeader } from '../common/SheetHeader';
import { ExpandableRow } from '../common/ExpandableRow';

interface HowToUseModalProps {
  onClose: () => void;
}

interface GuideSection {
  icon: LucideIcon;
  title: string;
  time: string;
  /** "Label: text" items show the label in bold */
  items: string[];
  tryThis?: string;
}

const SECTIONS: GuideSection[] = [
  {
    icon: Sprout,
    title: 'Getting started',
    time: '30 sec',
    items: [
      'Timer: your journey timer counts days, hours and minutes since your start or last relapse',
      'Growth stages: your plant grows from 🫘 Seed to 🌳 Tree as time passes',
      'Urge button: the (!) button at the top right of Home opens instant support',
    ],
    tryThis: 'Tap "Log a win" after your morning walk to log your first activity.',
  },
  {
    icon: Activity,
    title: 'Logging',
    time: '2 min',
    items: [
      'Log a win: record healthy activities like exercise, meditation or time with friends',
      'Categories: pick up to 5 per entry, add your own emoji tags (long press to remove) and an optional note',
      'Log relapse: private, with up to 5 trigger tags, an optional note and an earlier time if needed',
      'Healthy Distractions: tap a card on Home to log a win with its category already picked',
    ],
  },
  {
    icon: BarChart3,
    title: 'History & insights',
    time: '1 min',
    items: [
      'Home tiles: Days kept, Best streak, Wins logged and Average streak',
      'History: switch between List, Garden and Calendar views of your journey',
      'Advanced Insights: Engagement Ratio, Weekly Pattern, Monthly Trend, comparisons and Activity Insights',
      'Milestones: 14 time-based stages that unlock with time since your last relapse',
      'Badges: earned by actions, like logging activities a few days in a row',
    ],
  },
  {
    icon: Settings,
    title: 'Settings & privacy',
    time: '30 sec',
    items: [
      'Appearance: light or dark mode, and stage colors for the timer card',
      'Notifications: daily reminder, random motivation and milestone alerts',
      'App lock: protect the app with your fingerprint or face',
      'Export: save your full journey as an Excel file',
      'Reset: delete all data if you need a clean start (cannot be undone)',
    ],
  },
];

const TIPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Lock, title: 'Privacy first', text: 'Everything stays on your device. No cloud sync, no tracking, no accounts.' },
  { icon: TrendingUp, title: 'Progress over perfection', text: 'Relapses are part of recovery. The app helps you spot patterns and grow stronger.' },
  { icon: Info, title: 'Charts explain themselves', text: 'Tap the (i) on any chart to see how it works and how to use it.' },
];

/** "Label: text" → bold label, then the rest */
function GuideItem({ text }: { text: string }) {
  const colon = text.indexOf(': ');
  return (
    <View className="flex-row items-start gap-2.5 mb-2.5">
      <View className="w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
      <Text className="font-regular flex-1 text-sm text-body">
        {colon > 0 ? (
          <>
            <Text className="font-bold text-fg">{text.slice(0, colon)}</Text>
            {` ${text.slice(colon + 2)}`}
          </>
        ) : (
          text
        )}
      </Text>
    </View>
  );
}

export default function HowToUseModal({ onClose }: HowToUseModalProps) {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();

  return (
    <View className="flex-1 bg-bg">
      <SheetHeader title="How to use" subtitle="Get the most out of Seeding in a few minutes" onClose={onClose} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-10">
        {/* Guide sections, the first one open */}
        <View style={cardShadow} className="mt-2 rounded-[20px]">
          <View className="overflow-hidden border bg-surface border-border rounded-[20px]">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <ExpandableRow
                  key={section.title}
                  first={index === 0}
                  defaultOpen={index === 0}
                  title={section.title}
                  meta={section.time}
                  leading={
                    <View className="items-center justify-center rounded-full w-9 h-9 bg-primary-soft">
                      <Icon size={19} color={colors.primary} strokeWidth={2.25} />
                    </View>
                  }
                >
                  {section.items.map((item) => (
                    <GuideItem key={item} text={item} />
                  ))}
                  {section.tryThis && (
                    <View className="flex-row items-start gap-2.5 px-3.5 py-3 mt-1 rounded-2xl bg-subtle">
                      <Lightbulb size={17} color={colors.gold} strokeWidth={2.5} />
                      <Text className="font-regular flex-1 text-sm text-body">
                        <Text className="font-bold text-fg">Try this: </Text>
                        {section.tryThis}
                      </Text>
                    </View>
                  )}
                </ExpandableRow>
              );
            })}
          </View>
        </View>

        {/* Good to know */}
        <Text className="mt-7 mb-2 ml-1 text-xs font-bold tracking-widest uppercase text-muted">Good to know</Text>
        <View style={cardShadow} className="rounded-[20px]">
          <View className="overflow-hidden border bg-surface border-border rounded-[20px]">
            {TIPS.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <View key={tip.title} className={`flex-row items-start gap-3 px-4 py-3.5 ${index === 0 ? '' : 'border-t border-border'}`}>
                  <View className="items-center justify-center rounded-full w-9 h-9 bg-primary-soft">
                    <Icon size={18} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-fg">{tip.title}</Text>
                    <Text className="font-regular text-sm text-muted">{tip.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text className="font-regular mt-6 text-sm text-center text-muted">
          Daily check-ins build habits. Progress over perfection.
        </Text>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          className="items-center py-4 mt-5 rounded-2xl bg-primary active:bg-primary-ink"
        >
          <Text className="text-lg font-bold text-primary-on">Got it</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
