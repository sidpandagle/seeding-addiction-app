import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { getRandomTeaching, type StoicTeaching } from '../../data/stoicTeachings';
import { EMERGENCY_ACTIONS, getActionColorClasses } from '../../data/quickActionData';
import { X, RefreshCw, Brain } from 'lucide-react-native';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const [currentTeaching, setCurrentTeaching] = useState<StoicTeaching>(getRandomTeaching());

  const handleNewQuote = () => {
    setCurrentTeaching(getRandomTeaching());
  };

  const getCategoryColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'bg-blue-100 dark:bg-blue-950/30';
      case 'discipline':
        return 'bg-purple-100 dark:bg-purple-950/30';
      case 'resilience':
        return 'bg-amber-100 dark:bg-amber-950/30';
      case 'wisdom':
        return 'bg-emerald-100 dark:bg-emerald-950/30';
      case 'virtue':
        return 'bg-rose-100 dark:bg-rose-950/30';
    }
  };

  const getCategoryTextColor = (category: StoicTeaching['category']) => {
    switch (category) {
      case 'control':
        return 'text-blue-700 dark:text-blue-300';
      case 'discipline':
        return 'text-purple-700 dark:text-purple-300';
      case 'resilience':
        return 'text-amber-700 dark:text-amber-300';
      case 'wisdom':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'virtue':
        return 'text-rose-700 dark:text-rose-300';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Modern Header */}
        <View className="px-6 pt-16 pb-6 bg-rose-50 dark:bg-gray-900">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">You've Got This</Text>
              <Text className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                This urge will pass. You are stronger.
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

        {/* Stoic Teaching */}
        <View className="px-5 py-6">
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Brain size={24} color="#059669" strokeWidth={2} />
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Stoic Wisdom</Text>
              </View>
              <Pressable
                onPress={handleNewQuote}
                className="flex-row items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
              >
                <RefreshCw size={16} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">New</Text>
              </Pressable>
            </View>

            {/* Quote Card */}
            <View
              className={`p-5 rounded-xl ${getCategoryColor(currentTeaching.category)}`}
            >
              <Text className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                {currentTeaching.category}
              </Text>
              <Text className={`text-lg font-bold leading-7 mb-3 ${getCategoryTextColor(currentTeaching.category)}`}>
                "{currentTeaching.quote}"
              </Text>
              <Text className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                — {currentTeaching.author}
              </Text>
              <View className="pt-3 border-t border-gray-300 dark:border-gray-600">
                <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {currentTeaching.explanation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 pb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Take Action Now</Text>
          <View className="gap-3">
            {EMERGENCY_ACTIONS.map((action) => (
              <View 
                key={action.id}
                className={`p-5 rounded-xl ${getActionColorClasses(action.colorScheme)}`}
              >
                <Text className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                  {action.icon} {action.title}
                </Text>
                <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
                  {action.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reminder */}
        <View className="px-5 pb-12">
          <View className="p-6 bg-white border-dashed dark:bg-gray-900 rounded-2xl">
            <Text className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              This feeling is temporary
            </Text>
            <Text className="text-base leading-6 text-center text-gray-700 dark:text-gray-300">
              Urges typically last 15-20 minutes. You can outlast this. Stay strong. We believe in you.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
