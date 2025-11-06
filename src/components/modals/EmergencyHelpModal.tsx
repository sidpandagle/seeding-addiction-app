import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { useRelapseStore } from '../../stores/relapseStore';
import { EMERGENCY_ACTIONS, getActionColorClasses } from '../../data/quickActionData';
import { getRandomGreatMan } from '../../data/educationalContent';
import { X } from 'lucide-react-native';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const [greatMan, setGreatMan] = useState(getRandomGreatMan());
  const relapses = useRelapseStore((state) => state.relapses);

  // Calculate current streak (days since last relapse)
  const streakDays = useMemo(() => {
    if (relapses.length === 0) {
      // No relapses - calculate from first app use or return large number
      return 0; // Could be improved to track actual start date
    }

    const lastRelapseTime = new Date(relapses[relapses.length - 1].timestamp).getTime();
    const now = new Date().getTime();
    const daysPassed = Math.floor((now - lastRelapseTime) / (1000 * 60 * 60 * 24));
    return daysPassed;
  }, [relapses]);

  // Select 4 key emergency actions for display
  const selectedActions = useMemo(() => {
    const actionIds = ['physical-reset', 'breathe', 'mental-distraction', 'redirect-energy'];
    return EMERGENCY_ACTIONS.filter(a => actionIds.includes(a.id)).slice(0, 4);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
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

        {/* SECTION 1: Reality Check - Why You Shouldn't */}
        <View className="px-5 pb-6">
          <View className="p-5 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 rounded-xl">
            {/* Plant emoji and streak */}
            <View className="items-center mb-4">
              <Text className="mb-3 text-8xl">🌱</Text>
              {streakDays > 0 && (
                <Text className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {streakDays} {streakDays === 1 ? 'day' : 'days'} of growth
                </Text>
              )}
            </View>

            {/* Main message */}
            <Text className="mb-3 text-lg font-semibold leading-6 text-center text-emerald-900 dark:text-emerald-100">
              {streakDays > 0
                ? `You've grown for ${streakDays} ${streakDays === 1 ? 'day' : 'days'}. One click erases it all.`
                : "You've started your journey. Don't reset the progress you're making right now."}
            </Text>

            {/* Science message */}
            <Text className="text-sm text-center text-emerald-800 dark:text-emerald-200">
              Your brain is rewiring itself. Every day strengthens the new pathways. Don't interrupt what's healing.
            </Text>
          </View>
        </View>

        {/* SECTION 2: Quick Actions */}
        <View className="px-5 pb-6">
          <View className="mb-4">
            <Text className="mb-4 text-sm font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Right Now — Pick One - Take Action:
            </Text>

            {/* Action Buttons Grid */}
            <View className="flex-row flex-wrap justify-between gap-3">
              {selectedActions.map((action) => (
                <Pressable
                  key={action.id}
                  className={`flex-1 min-w-[45%] p-4 rounded-lg active:opacity-80 ${getActionColorClasses(action.colorScheme)}`}
                >
                  <Text className="mb-2 text-3xl text-center">{action.icon}</Text>
                  <Text className="text-xs font-semibold text-center text-gray-800 dark:text-gray-100">
                    {action.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Urge insight */}
          <View className="p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <Text className="text-sm font-semibold text-center text-emerald-900 dark:text-emerald-100">
              💨 Urges peak in ~20 minutes then fade. Ride the wave.
            </Text>
          </View>
        </View>

        {/* SECTION 3: Great Man Wisdom */}
        <View className="px-5 pb-6">
          <View className="p-5 border bg-amber-50 dark:bg-amber-950/30 rounded-xl border-amber-300 dark:border-amber-700">
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
                {greatMan.lesson}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="pb-12" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
