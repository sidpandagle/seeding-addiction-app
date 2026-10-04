import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { HistoryEntry } from '../../types/history';
import type { Relapse } from '../../db/schema';
import { formatRelapseTag } from '../../constants/tags';
import { getGrowthStage } from '../../utils/growthStages';
import { formatStreakAdjective } from '../../utils/formatDuration';
import { MS_PER_MINUTE } from '../../constants/timeUnits';
import { useCardShadow } from '../../hooks/useThemeColors';

interface EntryCardProps {
  entry: HistoryEntry;
  /** Activity categories already filtered to ones that still exist */
  categories?: string[];
  /** For a relapse: how long the streak it ended had run */
  endedStreakMs?: number;
  /** Relapses open the edit screen when tapped */
  onEditRelapse?: (relapse: Relapse) => void;
}

/**
 * One history entry (relapse or activity). Shared by the List and the Calendar day details
 * so both always look the same.
 */
function EntryCardComponent({ entry, categories, endedStreakMs, onEditRelapse }: EntryCardProps) {
  const cardShadow = useCardShadow();
  const isRelapse = entry.type === 'relapse';
  const data = entry.data;
  const date = new Date(data.timestamp);

  const content = (
    <>
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="mb-1 text-lg font-bold text-fg">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-regular text-base">🕐</Text>
            <Text className="text-sm font-medium text-muted">
              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View className={`px-4 py-2 rounded-full ${isRelapse ? 'bg-relapse-soft' : 'bg-primary-soft'}`}>
          <Text className={`text-xs font-bold ${isRelapse ? 'text-relapse-ink' : 'text-primary-ink'}`}>
            {isRelapse ? '📍 Relapse' : '✨ Activity'}
          </Text>
        </View>
      </View>

      {/* Which streak this relapse ended */}
      {isRelapse && endedStreakMs !== undefined && endedStreakMs >= MS_PER_MINUTE && (
        <Text className="mb-3 text-sm text-muted font-regular">
          Ended a{' '}
          <Text className="font-semibold text-primary-ink">
            {formatStreakAdjective(endedStreakMs)} streak · {getGrowthStage(endedStreakMs).emoji} {getGrowthStage(endedStreakMs).label}
          </Text>
        </Text>
      )}

      {data.note && (
        <View className="p-4 mb-3 bg-bg rounded-xl">
          <Text className="text-sm leading-6 text-body font-regular">{data.note}</Text>
        </View>
      )}

      {entry.type === 'relapse' && entry.data.tags && entry.data.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-1">
          {entry.data.tags.map((tag) => (
            <View key={tag} className="px-3 py-1.5 bg-relapse-soft rounded-full">
              <Text className="text-xs font-bold text-relapse-ink">{formatRelapseTag(tag)}</Text>
            </View>
          ))}
        </View>
      )}

      {!isRelapse && categories && categories.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-1">
          {categories.map((category) => (
            <View key={category} className="px-3 py-1.5 bg-primary-soft rounded-full">
              <Text className="text-xs font-bold text-primary-ink">{category}</Text>
            </View>
          ))}
        </View>
      )}

      {isRelapse && onEditRelapse && (
        <Text className="self-end mt-3 text-xs font-semibold text-faint">Tap to edit ›</Text>
      )}
    </>
  );

  const cardClass = `p-5 bg-surface rounded-[20px] border ${
    isRelapse ? 'border-relapse/30' : 'border-primary/30'
  }`;

  if (entry.type === 'relapse' && onEditRelapse) {
    const relapse = entry.data;
    return (
      <Pressable
        onPress={() => onEditRelapse(relapse)}
        accessibilityRole="button"
        accessibilityHint="Opens this relapse to edit or delete it"
        style={cardShadow}
        className={`${cardClass} active:opacity-80`}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardShadow} className={cardClass}>{content}</View>;
}

export const EntryCard = memo(EntryCardComponent);
