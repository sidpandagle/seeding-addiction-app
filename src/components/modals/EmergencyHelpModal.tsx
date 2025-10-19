import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { QUICK_ACTIONS, getActionColorClasses } from '../../data/quickActionData';
import { getRandomGreatMan } from '../../data/educationalContent';
import { X, Crown } from 'lucide-react-native';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const [greatMan, setGreatMan] = useState(getRandomGreatMan());

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Modern Header */}
        <View className="px-6 pt-16 pb-6">
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

        {/* Great Men Who Conquered Lust */}
        <View className="px-5 pb-6">
          <View className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <Text className="mb-1 text-xs font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400">
              {greatMan.title}
            </Text>
            <Text className="mb-3 text-xl font-bold text-amber-900 dark:text-amber-100">
              {greatMan.name}
            </Text>
            <Text className="mb-3 text-sm italic leading-6 text-amber-800 dark:text-amber-200">
              "{greatMan.wisdom}"
            </Text>
            <View className="pt-3 border-t border-amber-300 dark:border-amber-700">
              <Text className="text-sm font-semibold leading-6 text-amber-900 dark:text-amber-100">
                Lesson: {greatMan.lesson}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 pb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Take Action Now</Text>
          <View className="gap-3">
            {QUICK_ACTIONS.map((action) => (
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
