import { View, Text } from 'react-native';
import type { HistoryEntry } from '../../types/history';
import type { Relapse } from '../../db/schema';
import { getLocalDateString } from '../../utils/dateHelpers';
import { filterValidCategories } from '../../constants/tags';
import { useCustomActivityTagsStore } from '../../stores/customActivityTagsStore';
import { EntryCard } from './EntryCard';

interface CalendarRelapseDetailsProps {
  selectedDate: string | null;
  entries: HistoryEntry[];
  /** Relapse id -> length of the streak it ended */
  endedStreakMs?: Map<string, number>;
  onEditRelapse?: (relapse: Relapse) => void;
}

export default function CalendarRelapseDetails({ selectedDate, entries, endedStreakMs, onEditRelapse }: CalendarRelapseDetailsProps) {
  const customTags = useCustomActivityTagsStore((state) => state.customTags);

  if (!selectedDate) {
    return (
      <View className="px-6 py-8 mx-6 mt-2">
        <View className="items-center p-8 bg-surface rounded-3xl">
          <View className="items-center justify-center w-16 h-16 mb-4 bg-info-soft rounded-xl">
            <Text className="font-regular text-3xl">📅</Text>
          </View>
          <Text className="text-base font-semibold text-center text-muted">
            Select a date to view details
          </Text>
        </View>
      </View>
    );
  }

  // Filter entries for the selected date
  const dayEntries = entries.filter((entry) => getLocalDateString(entry.data.timestamp) === selectedDate);

  // Separate relapses and activities
  const dayRelapses = dayEntries.filter(e => e.type === 'relapse');
  const dayActivities = dayEntries.filter(e => e.type === 'activity');

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (dayEntries.length === 0) {
    return (
      <View className="px-6 py-6 mx-6 mt-2 mb-6 bg-surface rounded-3xl">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="items-center justify-center w-12 h-12 bg-info-soft rounded-xl">
            <Text className="font-regular text-2xl">✨</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-base font-bold text-fg">{formattedDate}</Text>
            <Text className="text-sm font-medium text-info">
              No events on this day
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Relapses are amber everywhere in the app; days with both get the same amber header
  const hasRelapse = dayRelapses.length > 0;
  const headerIcon = hasRelapse ? (dayActivities.length > 0 ? '📊' : '📍') : '✨';
  const headerBgColor = hasRelapse ? 'bg-relapse-soft' : 'bg-primary-soft';
  const headerTextColor = hasRelapse ? 'text-relapse-ink' : 'text-primary';

  return (
    <View className="mx-6 mt-2 mb-6">
      <View className="flex-row items-center gap-3 mb-5">
        <View className={`items-center justify-center w-12 h-12 rounded-xl ${headerBgColor}`}>
          <Text className="font-regular text-2xl">{headerIcon}</Text>
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-bold text-fg">{formattedDate}</Text>
          <Text className={`text-sm font-bold ${headerTextColor}`}>
            {dayEntries.length} {dayEntries.length === 1 ? 'event' : 'events'} recorded
            {dayRelapses.length > 0 && dayActivities.length > 0 && (
              <Text className="font-regular text-xs text-muted">
                {' '}({dayRelapses.length} relapse, {dayActivities.length} activity)
              </Text>
            )}
          </Text>
        </View>
      </View>

      {/* Render relapses first */}
      {dayRelapses.length > 0 && (
        <View className="gap-3 mb-4">
          <Text className="text-xs font-bold tracking-wide uppercase text-relapse-ink">
            Relapses ({dayRelapses.length})
          </Text>
          {dayRelapses.map((entry) => (
            <EntryCard
              key={entry.data.id}
              entry={entry}
              endedStreakMs={endedStreakMs?.get(entry.data.id)}
              onEditRelapse={onEditRelapse}
            />
          ))}
        </View>
      )}

      {/* Render activities */}
      {dayActivities.length > 0 && (
        <View className={`gap-3 ${dayRelapses.length > 0 ? 'mt-4' : ''}`}>
          <Text className="text-xs font-bold tracking-wide text-primary uppercase">
            Activities Logged ({dayActivities.length})
          </Text>
          {dayActivities.map((entry) => (
            <EntryCard
              key={entry.data.id}
              entry={entry}
              categories={
                entry.type === 'activity' && entry.data.categories
                  ? filterValidCategories(entry.data.categories, customTags)
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}
