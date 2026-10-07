import { View, Text, ScrollView, Pressable } from 'react-native';
import { Shield, UserX, CloudOff } from 'lucide-react-native';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { APP_VERSION } from '../../constants/appInfo';
import AppIcon from '../common/AppIcon';
import { SheetHeader } from '../common/SheetHeader';
import { ExpandableRow } from '../common/ExpandableRow';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({
  onClose,
}: Readonly<AboutModalProps>) {
  const colors = useThemeColors();
  const cardShadow = useCardShadow();

  const faqItems = [
    {
      question: "What's the plant metaphor?",
      answer:
        "It's just a way to make this whole thing feel a little lighter. Your journey is like growing a plant: your plant grows automatically with time,from seed 🫘 to a full tree 🌳 over the course of your recovery journey. When you track healthy activities, you're building resilience and spotting patterns that help you stay strong. The plant represents your time, the activities represent your momentum. If you log a relapse, your plant returns to the seed stage and your journey timer resets.",
    },
    {
      question: "Should I track every relapse?",
      answer:
        "If you can, yeah,because it's not about shame, it's about patterns. Tracking helps you spot what led up to it (stress, boredom, late nights, certain apps, whatever). And if you don't log one, that's okay too. This app isn't your judge,it's your notebook.",
    },
    {
      question: "How do achievements unlock?",
      answer:
        "Two kinds. Milestones are time-based (how long since your last relapse). Badges are action-based (like logging healthy activities a few days in a row). Think of it as: time shows endurance, actions show momentum.",
    },
    {
      question: "Is my data really private?",
      answer:
        "Yep. Your recovery data is 100% local: no accounts, no cloud sync, no tracking. Everything stays on your phone",
    },
    {
      question: "What are the activity categories?",
      answer:
        "They're just buckets to help you see what actually helps you. Stuff like Exercise, Meditation, Social Connection, Creative Expression, etc. You can pick up to 5 per entry, add custom emoji tags, and write a quick note if you want.",
    },
    {
      question: "How does the engagement ratio work?",
      answer:
        "Super simple: it's a vibe-check for momentum. It compares how often you're doing healthy stuff versus how often you're slipping. Higher means you're stacking more good days and better habits relative to setbacks.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Yep! You can export as Excel with comprehensive analytics, charts, and insights. Handy if you want to review things on a bigger screen or share a summary with someone you trust.",
    },
    {
      question: "What if I forget to log activities?",
      answer:
        "Totally normal. Turn on daily reminders in Settings and pick a time that fits your day (like after dinner). The goal is to make logging feel like brushing your teeth,not a huge project.",
    },
  ];

  const privacyPoints = [
    { icon: Shield, title: '100% local storage', text: 'Everything stays on your device.' },
    { icon: UserX, title: 'No account', text: 'No sign-up, no email, nothing to log in to.' },
    { icon: CloudOff, title: 'No cloud, no tracking', text: 'No sync and no analytics. Nobody is watching.' },
  ];

  return (
    <View className="flex-1 bg-bg">
      <SheetHeader title="About Seeding" subtitle="Private recovery tracking, built for you" onClose={onClose} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-10">
        {/* App info */}
        <View style={cardShadow} className="mt-2 rounded-[20px]">
          <View className="items-center p-6 border bg-surface border-border rounded-[20px]">
            <AppIcon size={72} />
            <Text className="mt-3 text-2xl font-bold text-fg">Seeding</Text>
            <View className="px-2.5 py-1 mt-1.5 rounded-full bg-subtle">
              <Text className="text-xs font-bold text-muted">Version {APP_VERSION}</Text>
            </View>
            <Text className="font-regular mt-4 text-sm text-center text-body">
              Think of Seeding like a calm, private pocket journal. Track what helps, notice patterns, and keep
              moving forward, one day at a time.
            </Text>
          </View>
        </View>

        {/* Privacy promise */}
        <Text className="mt-7 mb-2 ml-1 text-xs font-bold tracking-widest uppercase text-muted">Privacy promise</Text>
        <View style={cardShadow} className="rounded-[20px]">
          <View className="overflow-hidden border bg-surface border-border rounded-[20px]">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <View key={point.title} className={`flex-row items-center gap-3 px-4 py-3.5 ${index === 0 ? '' : 'border-t border-border'}`}>
                  <View className="items-center justify-center rounded-full w-9 h-9 bg-primary-soft">
                    <Icon size={18} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-fg">{point.title}</Text>
                    <Text className="font-regular text-sm text-muted">{point.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* FAQ */}
        <Text className="mt-7 mb-2 ml-1 text-xs font-bold tracking-widest uppercase text-muted">Questions</Text>
        <View style={cardShadow} className="rounded-[20px]">
          <View className="overflow-hidden border bg-surface border-border rounded-[20px]">
            {faqItems.map((item, index) => (
              <ExpandableRow key={item.question} title={item.question} first={index === 0}>
                <Text className="font-regular text-sm text-body">{item.answer}</Text>
              </ExpandableRow>
            ))}
          </View>
        </View>

        <Text className="font-regular mt-6 text-sm text-center text-muted">
          Built with care for people trying to get better. You're not alone, and even messy progress is still
          progress.
        </Text>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          className="items-center py-4 mt-5 rounded-2xl bg-primary active:bg-primary-ink"
        >
          <Text className="text-lg font-bold text-primary-on">Close</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
