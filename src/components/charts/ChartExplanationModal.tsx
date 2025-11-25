import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { X, Info } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';

interface ChartExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  chartType: 'resistance' | 'weekly' | 'monthly';
}

const CHART_EXPLANATIONS = {
  resistance: {
    title: '📊 Engagement Ratio Chart',
    subtitle: 'Understanding Your Activity Balance',
    sections: [
      {
        heading: 'What This Chart Shows',
        content: 'This pie chart compares your positive activities (growth actions) against relapses, showing the overall balance of your recovery journey.',
      },
      {
        heading: 'How It\'s Calculated',
        items: [
          'Counts all logged activities (water your plant actions)',
          'Counts all logged relapses',
          'Calculates percentage: (Activities ÷ Total Events) × 100',
          'Example: 80 activities + 20 relapses = 80% engagement ratio',
        ],
      },
      {
        heading: 'What Good Looks Like',
        items: [
          '70%+ activities = Strong engagement pattern',
          '50-70% activities = Balanced progress',
          'Below 50% = Opportunity to increase positive actions',
        ],
      },
      {
        heading: 'How to Use This Data',
        content: 'A higher activity percentage shows you\'re building positive habits. If the ratio is low, focus on logging more growth activities daily to shift the balance.',
      },
    ],
  },
  weekly: {
    title: '📅 Weekly Pattern Chart',
    subtitle: 'Identifying Your Vulnerable Days',
    sections: [
      {
        heading: 'What This Chart Shows',
        content: 'This bar chart reveals which days of the week you\'re most vulnerable to relapse, helping you identify patterns and prepare accordingly.',
      },
      {
        heading: 'How It\'s Calculated',
        items: [
          'Groups all relapses by day of week (Monday-Sunday)',
          'Counts occurrences for each day',
          'Displays current week\'s date range',
          'Updates automatically as you log events',
        ],
      },
      {
        heading: 'Common Patterns',
        items: [
          'Weekend spikes: Often due to less structure',
          'Monday peaks: Stress from week starting',
          'Mid-week dips: Settled into routine',
          'Friday increases: Anticipation of weekend freedom',
        ],
      },
      {
        heading: 'How to Use This Data',
        content: 'Once you identify high-risk days, plan extra support: schedule activities, avoid triggers, reach out to accountability partners, or practice coping strategies preemptively.',
      },
    ],
  },
  monthly: {
    title: '📈 Monthly Trend Chart',
    subtitle: 'Tracking Your Long-Term Progress',
    sections: [
      {
        heading: 'What This Chart Shows',
        content: 'This line chart displays your relapse frequency over the last 6 months, revealing whether you\'re improving, plateauing, or struggling.',
      },
      {
        heading: 'How It\'s Calculated',
        items: [
          'Groups relapses by calendar month',
          'Shows last 6 months of data',
          'Calculates trend: compares first 3 months vs last 3 months',
          'Improving trend = decreasing relapse frequency',
        ],
      },
      {
        heading: 'Understanding Trends',
        items: [
          'Downward trend = Making progress (fewer relapses)',
          'Flat line = Maintaining current level',
          'Upward trend = Need to reassess strategies',
          'Zigzag pattern = Common - recovery isn\'t linear',
        ],
      },
      {
        heading: 'How to Use This Data',
        content: 'Don\'t judge yourself by short-term fluctuations. Focus on the overall direction. If trending upward, review what changed and adjust your recovery plan.',
      },
      {
        heading: 'Research Background',
        content: 'Studies show that long-term recovery involves multiple attempts. The average person makes 5-7 serious attempts before achieving sustained recovery. Progress trends, not perfection, predict success.',
      },
    ],
  },
};

export default function ChartExplanationModal({
  visible,
  onClose,
  chartType,
}: ChartExplanationModalProps) {
  const colorScheme = useColorScheme();
  const explanation = CHART_EXPLANATIONS[chartType];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-gray-50 dark:bg-gray-950 rounded-t-3xl">
          {/* Header */}
          <View className="px-6 pt-8 pb-4 border-b border-gray-200 dark:border-gray-800">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {explanation.title}
                </Text>
                <Text className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {explanation.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="items-center justify-center w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700"
              >
                <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
            {explanation.sections.map((section, index) => (
              <View key={index} className="mb-6">
                <Text className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                  {section.heading}
                </Text>

                {section.content && (
                  <Text className="mb-2 text-sm leading-6 text-gray-700 dark:text-gray-300 font-regular">
                    {section.content}
                  </Text>
                )}

                {section.items && (
                  <View className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                    {section.items.map((item, itemIndex) => (
                      <View key={itemIndex} className="flex-row mb-2 last:mb-0">
                        <Text className="mr-2 text-sm text-emerald-600 dark:text-emerald-400">
                          •
                        </Text>
                        <Text className="flex-1 text-sm leading-5 text-gray-700 dark:text-gray-300 font-regular">
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              className="py-4 mt-4 mb-16 rounded-2xl bg-emerald-600 dark:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-800"
            >
              <Text className="text-base font-bold text-center text-white">Got It!</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
