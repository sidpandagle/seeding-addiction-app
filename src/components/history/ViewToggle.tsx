import { View, Text, Pressable } from 'react-native';

type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onModeChange }: Readonly<ViewToggleProps>) {
  return (
    <View className="flex-row p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 rounded-2xl">
      <Pressable
        onPress={() => onModeChange('list')}
        className={`flex-1 py-3 px-4 rounded-xl ${
          mode === 'list' ? 'bg-blue-400 dark:bg-blue-950' : ''
        }`}
      >
        <Text
          className={`text-sm font-bold text-center ${
            mode === 'list' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          List
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange('calendar')}
        className={`flex-1 py-3 px-4 rounded-xl ${
          mode === 'calendar' ? 'bg-blue-400 dark:bg-blue-950' : ''
        }`}
      >
        <Text
          className={`text-sm font-bold text-center ${
            mode === 'calendar' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Calendar
        </Text>
      </Pressable>
    </View>
  );
}
