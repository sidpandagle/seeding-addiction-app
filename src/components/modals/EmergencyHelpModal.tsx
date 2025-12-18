import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '../../stores/themeStore';
import { useRelapseStore } from '../../stores/relapseStore';
import {
  TAPE_FORWARD,
  PHYSICAL_SHOCK_ACTIONS,
} from '../../data/educationalContent';
import { X } from 'lucide-react-native';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export default function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const colorScheme = useColorScheme();
  const relapses = useRelapseStore((state) => state.relapses);

  // Calculate current streak (days since last relapse)
  const streakDays = useMemo(() => {
    if (relapses.length === 0) {
      return 0;
    }

    const lastRelapseTime = new Date(relapses[relapses.length - 1].timestamp).getTime();
    const now = new Date().getTime();
    const daysPassed = Math.floor((now - lastRelapseTime) / (1000 * 60 * 60 * 24));
    return daysPassed;
  }, [relapses]);

  // Dynamic plant emoji based on streak progress
  const getPlantStage = (days: number) => {
    if (days >= 90) return { emoji: '🌳', label: 'Mighty Oak', message: 'You are unshakeable.' };
    if (days >= 30) return { emoji: '🌿', label: 'Thriving', message: 'Deep roots forming.' };
    if (days >= 7) return { emoji: '🪴', label: 'Growing Strong', message: 'Taking shape.' };
    return { emoji: '🌱', label: 'Seedling', message: 'Every journey starts here.' };
  };

  const plantStage = getPlantStage(streakDays);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-950"
    >
      <ScrollView className="flex-1">
        {/* Header - Empathetic acknowledgment */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                This is hard.
              </Text>
              <Text className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                But you've felt this before and survived. You'll survive this too.
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

        {/* SECTION: Reality Check - Plant/Streak */}
        <View className="px-5 pb-5">
          <View className="p-5 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 rounded-xl">
            <View className="items-center mb-4">
              <Text className="mb-3 text-8xl">{plantStage.emoji}</Text>
              {streakDays > 0 && (
                <Text className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {streakDays} {streakDays === 1 ? 'day' : 'days'} of growth
                </Text>
              )}
            </View>
            <Text className="mb-3 text-lg font-semibold leading-6 text-center text-emerald-900 dark:text-emerald-100">
              {streakDays > 0
                ? `You've grown for ${streakDays} ${streakDays === 1 ? 'day' : 'days'}. One click erases it all.`
                : "You've started your journey. Don't reset the progress you're making right now."}
            </Text>
            <Text className="text-sm text-center text-emerald-800 dark:text-emerald-200">
              Your brain is rewiring itself. Every day strengthens the new pathways. Don't interrupt what's healing.
            </Text>
          </View>
        </View>

        

        {/* SECTION 2: Play the Tape Forward */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
            Fast Forward 30 Minutes
          </Text>
          <View className="flex-row gap-3">
            {/* Give In Column */}
            <View className="flex-1 p-4 border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700 rounded-xl">
              <Text className="mb-3 text-sm font-bold text-center text-red-700 dark:text-red-400">
                If you give in:
              </Text>
              {TAPE_FORWARD.giveIn.map((item, index) => (
                <Text key={index} className="mb-1.5 text-sm text-justify text-red-700 dark:text-red-300">
                  - {item}
                </Text>
              ))}
            </View>
            {/* Resist Column */}
            <View className="flex-1 p-4 border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 rounded-xl">
              <Text className="mb-3 text-sm font-bold text-center text-emerald-800 dark:text-emerald-200">
                If you resist:
              </Text>
              {TAPE_FORWARD.resist.map((item, index) => (
                <Text key={index} className="text-sm text-emerald-700 dark:text-emerald-300">
                  - {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 4: Physical Shock Actions */}
        <View className="px-5 pb-5">
          <Text className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
            Shock Your System — Pick One Now
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PHYSICAL_SHOCK_ACTIONS.map((action, index) => (
              <View
                key={index}
                className="flex-row items-center px-3 py-2.5 border bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 rounded-lg"
                style={{ width: '48%' }}
              >
                <Text className="mr-2 text-lg">{action.icon}</Text>
                <Text className="flex-1 text-xs font-medium text-indigo-900 dark:text-white">
                  {action.action}
                </Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-xs text-center text-gray-500 dark:text-gray-500">
            Physical discomfort interrupts the craving circuit.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="pb-12" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
