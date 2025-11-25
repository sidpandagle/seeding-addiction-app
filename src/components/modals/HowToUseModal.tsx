import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { X, Home, TrendingUp, Settings, Activity, BarChart3, Info } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

interface HowToUseModalProps {
  onClose: () => void;
}

export default function HowToUseModal({ onClose }: HowToUseModalProps) {
  const colorScheme = useColorScheme();

  const sections = [
    {
      icon: Home,
      color: '#10b981',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      title: '🌱 Getting Started',
      timeEstimate: '30 seconds',
      items: [
        'Your journey timer shows days, hours, and minutes of progress',
        'Growth stages progress from 🫘 Seed to 🌳 Tree as you grow',
        'Tap the green button to "Water Your Plant" and log healthy activities',
        'Red ? button in top-right provides emergency support anytime',
        'Try this: Log "Exercise" after your morning walk to start tracking!',
      ],
    },
    {
      icon: Activity,
      color: '#10b981',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      title: '💧 Core Tracking Features',
      timeEstimate: '2 minutes',
      items: [
        'Water Your Plant: Track healthy activities with categories like Exercise, Meditation, Social Connection',
        'Select up to 5 activity categories per entry and add optional reflections',
        'Log Relapse: Privacy-first tracking with optional notes about triggers or context',
        'Quick Actions: One-tap activity logging from home screen cards',
        'View weekly stats, streaks, and celebrate milestones',
        'Privacy reminder: All data stays on your device—no cloud, no tracking',
      ],
    },
    {
      icon: TrendingUp,
      color: '#3b82f6',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      title: '📊 Analytics & Insights',
      timeEstimate: '1 minute',
      items: [
        'Dashboard Charts: Resistance Ratio (activities vs relapses), Weekly Pattern, Monthly Trend',
        'Tap the (i) icon on any chart for detailed explanations of how it\'s calculated',
        'Achievement System: 14 time-based milestones from 5 minutes to 1 year',
        'Roadmap shows your progress journey with unlocked badges',
        'Stats Grid: Track total attempts, best streak, activities logged, and success rate',
        'Achievements unlock automatically based on elapsed time since last relapse',
      ],
    },
    {
      icon: Settings,
      color: '#9333ea',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      title: '⚙️ Settings & Privacy',
      timeEstimate: '30 seconds',
      items: [
        'Theme: Switch between Light and Dark mode',
        'Security: Enable biometric app lock (Face ID, Touch ID, or fingerprint)',
        'Education: Learn about dopamine science and recovery principles',
        'Data Management: Reset all data if needed (irreversible action)',
        'Your data is 100% local—no accounts, no cloud sync, no tracking',
      ],
    },
  ];

  const tips = [
    {
      icon: Info,
      title: 'Privacy First',
      description: 'All data is stored locally on your device. No cloud sync, no tracking, no accounts.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Over Perfection',
      description: 'Relapses are part of recovery. The app helps you identify patterns and grow stronger.',
    },
    {
      icon: BarChart3,
      title: 'Charts Explain Themselves',
      description: 'Tap the (i) icon on any chart to learn how it\'s calculated and how to use the data.',
    },
  ];

  const commonQuestions = [
    {
      question: "What's the plant metaphor?",
      answer: "Activities = watering your plant; growth stages = your progress from seed to tree.",
    },
    {
      question: "Should I track every relapse?",
      answer: "Honesty helps identify patterns, no judgment. Every restart is progress.",
    },
    {
      question: "How do achievements unlock?",
      answer: "Automatically based on elapsed time since your last relapse.",
    },
    {
      question: "Is my data really private?",
      answer: "Yes—100% local storage, no accounts, no sync. Your data never leaves your device.",
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
                How to Use
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
                Master the app in minutes
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
        {/* Features by Section */}
        <View className="px-6 mt-4">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <View key={index} className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 gap-3">
                    <View className={`items-center justify-center w-10 h-10 rounded-full ${section.bgColor}`}>
                      <IconComponent size={20} color={section.color} strokeWidth={2.5} />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {section.timeEstimate}
                  </Text>
                </View>

                <View className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                  {section.items.map((item, itemIndex) => {
                    const isTryThis = item.startsWith('Try this:');
                    return (
                      <View key={itemIndex} className="flex-row mb-2.5 last:mb-0">
                        <Text className="mr-2 text-sm text-emerald-600 dark:text-emerald-400">•</Text>
                        <Text
                          className={`flex-1 text-sm leading-5 ${
                            isTryThis
                              ? 'italic text-emerald-700 dark:text-emerald-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {item}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Pro Tips & Common Questions */}
        <View className="px-6 mt-2 mb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            💡 Pro Tips & Common Questions
          </Text>

          {/* Pro Tips */}
          {tips.map((tip, index) => {
            const TipIcon = tip.icon;
            return (
              <View key={index} className="p-4 mb-3 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                <View className="flex-row items-start gap-3">
                  <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                    <TipIcon size={16} color="#10b981" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
                      {tip.title}
                    </Text>
                    <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                      {tip.description}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Common Questions */}
          <View className="mt-6">
            <Text className="mb-3 text-base font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </Text>
            {commonQuestions.map((qa, index) => (
              <View key={index} className="p-4 mb-3 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                <Text className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                  Q: {qa.question}
                </Text>
                <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                  {qa.answer}
                </Text>
              </View>
            ))}
          </View>

          {/* Final Tip */}
          <View className="p-4 mt-3 border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
            <Text className="text-sm font-semibold leading-5 text-center text-emerald-800 dark:text-emerald-300">
              💚 Daily check-ins build habits. Progress over perfection!
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
              Got It!
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
