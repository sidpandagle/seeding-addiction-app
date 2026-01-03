import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Shield, HelpCircle } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({
  onClose,
}: Readonly<AboutModalProps>) {
  const colorScheme = useColorScheme();

  const faqItems = [
    {
      question: "What's the plant metaphor?",
      answer:
        "It's just a way to make this whole thing feel a little lighter. Your journey is like growing a plant: your plant grows automatically with time—from seed 🫘 to a full tree 🌳 over the course of your recovery journey. When you track healthy activities, you're building resilience and spotting patterns that help you stay strong. The plant represents your time, the activities represent your momentum. If you log a relapse, your plant returns to the seed stage and your journey timer resets.",
    },
    {
      question: "Should I track every relapse?",
      answer:
        "If you can, yeah—because it's not about shame, it's about patterns. Tracking helps you spot what led up to it (stress, boredom, late nights, certain apps, whatever). And if you don't log one, that's okay too. This app isn't your judge—it's your notebook.",
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
      question: "How does the resistance ratio work?",
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
        "Totally normal. Turn on daily reminders in Settings and pick a time that fits your day (like after dinner). The goal is to make logging feel like brushing your teeth—not a huge project.",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View className="pt-16 pb-4">
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                About Seeding
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
                Private recovery tracking, built for you
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="items-center justify-center w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700"
            >
              <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* App Info Card */}
        <View className="px-6 mt-4">
          <View className="items-center p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            <View className="w-20 h-20 mb-4 overflow-hidden rounded-2xl">
              <LinearGradient
                colors={colorScheme === 'dark' ? ['rgba(6, 78, 59, 0.3)', 'rgba(19, 78, 74, 0.3)'] : ['#d1fae5', '#ccfbf1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center justify-center flex-1"
              >
                <Text className="text-4xl">🌱</Text>
              </LinearGradient>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Seeding
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </Text>
            <Text className="mt-4 text-sm leading-6 text-center text-gray-600 dark:text-gray-400">
              Think of Seeding like a calm, private pocket journal. Track what helps, notice patterns,
              and keep moving forward—one day at a time.
            </Text>
          </View>
        </View>

        {/* Privacy Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Shield size={18} color={colorScheme === 'dark' ? '#10b981' : '#059669'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Privacy Promise
            </Text>
          </View>

          <View className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            <View className="flex-row items-start gap-3 mb-4">
              <View className="items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                <Shield size={20} color="#10b981" strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-bold text-gray-900 dark:text-white">
                  100% Local Storage
                </Text>
                <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                  All your data stays on your device. No accounts, no cloud sync, no tracking.
                </Text>
              </View>
            </View>

            <View className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <Text className="text-xs leading-5 text-gray-500 dark:text-gray-500">
                Your journey is personal. That's why Seeding keeps everything on your device and skips
                accounts and analytics. You should be able to use this app without worrying who's
                watching.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <HelpCircle size={18} color={colorScheme === 'dark' ? '#a855f7' : '#9333ea'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Frequently Asked Questions
            </Text>
          </View>

          <View className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
            {faqItems.map((item, index) => (
              <View
                key={index}
                className={`p-4 ${index === faqItems.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-800'}`}
              >
                <Text className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                  {item.question}
                </Text>
                <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                  {item.answer}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Made with Love */}
        <View className="px-6 mt-4 mb-4">
          <View className="p-4 border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
            <Text className="text-sm font-medium leading-5 text-center text-emerald-800 dark:text-emerald-300">
              Built with care for people trying to get better. You're not alone—and even messy progress
              is still progress.
            </Text>
          </View>
        </View>

        {/* Close Button */}
        <View className="px-6 mb-8">
          <Pressable
            onPress={onClose}
            className="py-4 rounded-2xl bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800"
          >
            <Text className="text-lg font-semibold text-center text-white">
              Close
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
