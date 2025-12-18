import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { X, Info, Shield, HelpCircle, Heart, Coffee, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const colorScheme = useColorScheme();

  const faqItems = [
    {
      question: "What's the plant metaphor?",
      answer: "Your recovery journey is like growing a plant. Activities you log are like watering your plant - they help it grow stronger. Growth stages progress from a seed to a full tree as you build healthy habits and maintain your streak.",
    },
    {
      question: "Should I track every relapse?",
      answer: "Honesty with yourself is key to recovery. Tracking relapses helps identify patterns and triggers. Remember: every restart is still progress. There's no judgment here - just data to help you grow stronger.",
    },
    {
      question: "How do achievements unlock?",
      answer: "Achievements unlock automatically based on elapsed time since your last relapse. There are 14 milestones ranging from 5 minutes to 1 year. Each milestone celebrates your growing strength and resilience.",
    },
    {
      question: "Is my data really private?",
      answer: "Yes - 100% local storage, no accounts, no cloud sync, no tracking. Your data never leaves your device. We don't collect any personal information or usage analytics. Your journey is entirely your own.",
    },
    {
      question: "What are the activity categories?",
      answer: "Activities are grouped into categories like Exercise, Meditation, Social Connection, Creative Expression, and more. You can select up to 5 categories per entry and add optional notes about what you did.",
    },
    {
      question: "How does the resistance ratio work?",
      answer: "The resistance ratio compares your healthy activities to relapses. A higher percentage means you're building more positive habits relative to setbacks. It's a measure of your overall recovery momentum.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Premium users can export their journey data to CSV for spreadsheets or as a formatted report to share with therapists or support groups. Your data remains under your control.",
    },
    {
      question: "What if I forget to log activities?",
      answer: "You can enable daily reminders in Settings to get a notification at your preferred time. Random motivational messages throughout the day can also help keep you engaged with your journey.",
    },
  ];

  const handleBuyMeCoffee = async () => {
    const url = 'https://buymeacoffee.com/sidp';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening Buy Me a Coffee:', error);
    }
  };

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
                Privacy-focused recovery tracking
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
            <View className="items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl">
              <Text className="text-4xl">🌱</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Seeding
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </Text>
            <Text className="mt-4 text-sm leading-6 text-center text-gray-600 dark:text-gray-400">
              A compassionate companion for your recovery journey. Track progress, build healthy habits, and grow stronger every day.
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
                We believe your recovery journey is deeply personal. That's why Seeding was built with privacy as a core principle. Your data never leaves your device, and we don't collect any analytics or personal information.
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
                className={`p-4 ${index !== faqItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
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

        {/* Support Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Heart size={18} color={colorScheme === 'dark' ? '#f59e0b' : '#d97706'} strokeWidth={2.5} />
            <Text className="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
              Support Development
            </Text>
          </View>

          <Pressable
            onPress={handleBuyMeCoffee}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl active:opacity-70"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <Coffee size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    Buy Me a Coffee
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Help keep Seeding free and ad-free
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" strokeWidth={2.5} />
            </View>
          </Pressable>
        </View>

        {/* Made with Love */}
        <View className="px-6 mt-8 mb-4">
          <View className="p-4 border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
            <Text className="text-sm font-medium leading-5 text-center text-emerald-800 dark:text-emerald-300">
              Made with care for those on their recovery journey. You're not alone, and every step forward matters.
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
