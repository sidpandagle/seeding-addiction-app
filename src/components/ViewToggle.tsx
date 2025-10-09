import { View, Text, Pressable } from 'react-native';

type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <View className="flex-row p-2 mt-1 bg-gray-200 rounded-lg dark:bg-gray-700">
      <Pressable
        onPress={() => onModeChange('list')}
        className={`flex-1 py-2 px-4 rounded-md ${
          mode === 'list' ? 'bg-white dark:bg-gray-600' : ''
        }`}
      >
        <Text
          className={`text-sm font-medium text-center ${
            mode === 'list' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          List
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange('calendar')}
        className={`flex-1 py-2 px-4 rounded-md ${
          mode === 'calendar' ? 'bg-white dark:bg-gray-600' : ''
        }`}
      >
        <Text
          className={`text-sm font-medium text-center ${
            mode === 'calendar' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Calendar
        </Text>
      </Pressable>
    </View>
  );
}
