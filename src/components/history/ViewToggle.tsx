import { View, Text, Pressable } from 'react-native';
import { useCardShadow } from '../../hooks/useThemeColors';

export type HistoryViewMode = 'list' | 'garden' | 'calendar';

interface ViewToggleProps {
  mode: HistoryViewMode;
  onModeChange: (mode: HistoryViewMode) => void;
}

// One question per view: what happened, how long each run lasted, which dates
const OPTIONS: { mode: HistoryViewMode; label: string }[] = [
  { mode: 'list', label: 'List' },
  { mode: 'garden', label: 'Garden' },
  { mode: 'calendar', label: 'Calendar' },
];

export default function ViewToggle({ mode, onModeChange }: Readonly<ViewToggleProps>) {
  const cardShadow = useCardShadow();
  return (
    <View style={cardShadow} className="flex-row p-1.5 bg-surface border border-border rounded-2xl">
      {OPTIONS.map((option) => {
        const isActive = mode === option.mode;
        return (
          <Pressable
            key={option.mode}
            onPress={() => onModeChange(option.mode)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 py-3 px-4 rounded-xl ${isActive ? 'bg-primary-soft' : ''}`}
          >
            <Text
              className={`text-sm font-bold text-center ${
                isActive ? 'text-primary-ink' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
