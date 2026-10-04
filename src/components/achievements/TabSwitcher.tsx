import { View, Text, Pressable } from 'react-native';
import { useCardShadow } from '../../hooks/useThemeColors';

interface TabSwitcherProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabSwitcher({ tabs, activeTab, onTabChange }: Readonly<TabSwitcherProps>) {
  const cardShadow = useCardShadow();
  return (
    <View style={cardShadow} className="flex-row p-1.5 bg-surface border border-border rounded-2xl">
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 rounded-xl ${
            activeTab === tab.id ? 'bg-primary-soft' : ''
          }`}
        >
          <Text
            className={`text-sm font-bold text-center ${
              activeTab === tab.id
                ? 'text-primary-ink'
                : 'text-muted'
            }`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
