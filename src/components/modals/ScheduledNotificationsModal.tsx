import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { X, Bell, Trophy, Sparkles, Calendar } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import * as Notifications from 'expo-notifications';
import { GROWTH_STAGES } from '../../utils/growthStages';

interface ScheduledNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notifications.NotificationRequest[];
}

export default function ScheduledNotificationsModal({
  visible,
  onClose,
  notifications,
}: ScheduledNotificationsModalProps) {
  const colorScheme = useColorScheme();

  // Categorize notifications
  const achievements = notifications
    .filter(n => n.identifier.startsWith('notif-achievement-'))
    .sort((a, b) => {
      const aTrigger = a.trigger as any;
      const bTrigger = b.trigger as any;
      const aDate = aTrigger.type === 'date' ? new Date(aTrigger.value).getTime() : 0;
      const bDate = bTrigger.type === 'date' ? new Date(bTrigger.value).getTime() : 0;
      return aDate - bDate;
    });

  const motivational = notifications.filter(n =>
    n.identifier === 'notif-motivational-daily'
  );

  // Get achievement details by ID
  const getAchievementDetails = (achievementId: string) => {
    const stage = GROWTH_STAGES.find(s => s.id === achievementId);
    return stage
      ? { emoji: stage.emoji, title: stage.achievementTitle, label: stage.shortLabel }
      : { emoji: '🏆', title: achievementId, label: achievementId };
  };

  // Format date/time for display
  const formatTriggerTime = (trigger: any) => {
    if (trigger.type === 'date' && trigger.value) {
      const date = new Date(trigger.value);
      const now = new Date();
      const diff = date.getTime() - now.getTime();

      // Format absolute date/time
      const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
      const timeStr = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Calculate relative time
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let relativeStr = '';
      if (days > 0) {
        relativeStr = `in ${days}d ${hours}h`;
      } else if (hours > 0) {
        relativeStr = `in ${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        relativeStr = `in ${minutes}m`;
      } else {
        relativeStr = 'very soon';
      }

      return { absolute: `${dateStr}, ${timeStr}`, relative: relativeStr };
    }

    if (trigger.type === 'daily' || trigger.type === 'calendar') {
      const hour = String(trigger.hour || 0).padStart(2, '0');
      const minute = String(trigger.minute || 0).padStart(2, '0');
      return { absolute: `${hour}:${minute} daily`, relative: 'repeats daily' };
    }

    return { absolute: 'Unknown', relative: '' };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <View className="px-6 pt-16 pb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Bell size={24} color={colorScheme === 'dark' ? '#a855f7' : '#9333ea'} strokeWidth={2.5} />
                <Text className="text-2xl font-semibold tracking-wide text-gray-900 dark:text-white">
                  Scheduled Notifications
                </Text>
              </View>
              <Text className="text-sm font-medium tracking-wide text-purple-700 dark:text-purple-400">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} scheduled
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl active:scale-95"
            >
              <X size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Achievement Notifications */}
          {achievements.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Milestone Achievements ({achievements.length})
                </Text>
              </View>

              <View className="gap-3">
                {achievements.map((notification, index) => {
                  const achievementId = notification.identifier.replace('notif-achievement-', '');
                  const details = getAchievementDetails(achievementId);
                  const trigger = notification.trigger as any;
                  const timing = formatTriggerTime(trigger);

                  return (
                    <View
                      key={notification.identifier}
                      style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl"
                    >
                      <View className="flex-row items-start gap-3">
                        <Text className="text-2xl">{details.emoji}</Text>
                        <View className="flex-1">
                          <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {details.title}
                          </Text>
                          <View className="flex-row items-center gap-2 mb-1">
                            <Calendar size={14} color="#6b7280" strokeWidth={2} />
                            <Text className="text-xs text-gray-600 dark:text-gray-400">
                              {timing.absolute}
                            </Text>
                          </View>
                          {timing.relative && (
                            <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {timing.relative}
                            </Text>
                          )}
                        </View>
                        <View className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            {details.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Motivational Notifications */}
          {motivational.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Sparkles size={20} color="#8b5cf6" strokeWidth={2.5} />
                <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Daily Motivation ({motivational.length})
                </Text>
              </View>

              <View className="gap-3">
                {motivational.map((notification) => {
                  const trigger = notification.trigger as any;
                  const timing = formatTriggerTime(trigger);

                  return (
                    <View
                      key={notification.identifier}
                      style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl"
                    >
                      <View className="flex-row items-start gap-3">
                        <Text className="text-2xl">💭</Text>
                        <View className="flex-1">
                          <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                            Daily Motivational Quote
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Calendar size={14} color="#6b7280" strokeWidth={2} />
                            <Text className="text-xs text-gray-600 dark:text-gray-400">
                              {timing.absolute}
                            </Text>
                          </View>
                        </View>
                        <View className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Text className="text-xs font-bold text-purple-700 dark:text-purple-400">
                            Daily
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <View className="items-center justify-center py-12">
              <Bell size={48} color="#9ca3af" strokeWidth={1.5} />
              <Text className="mt-4 text-base font-medium text-gray-500 dark:text-gray-400">
                No notifications scheduled
              </Text>
              <Text className="mt-2 text-sm text-center text-gray-400 dark:text-gray-500">
                Enable notifications in settings to receive{'\n'}milestone alerts and daily motivation
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
