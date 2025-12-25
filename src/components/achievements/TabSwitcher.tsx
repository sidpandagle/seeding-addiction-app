import { View, Text, Pressable } from 'react-native';

interface TabSwitcherProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <View className="flex-row p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 rounded-2xl">
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 rounded-xl ${
            activeTab === tab.id ? 'bg-amber-400 dark:bg-amber-950' : ''
          }`}
        >
          <Text
            className={`text-sm font-bold text-center ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
