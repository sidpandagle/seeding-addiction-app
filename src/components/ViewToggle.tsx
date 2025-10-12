import { View, Text, Pressable } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1.5 bg-neutral-100 dark:bg-[#2F2D42] rounded-2xl">
      <Pressable
        onPress={() => onModeChange('list')}
        className={`flex-1 py-2.5 px-4 rounded-xl ${
          mode === 'list' ? 'bg-white dark:bg-[#3D3A52]' : ''
        }`}
      >
        <Text
          className={`text-sm font-semibold text-center ${
            mode === 'list' ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          List
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange('calendar')}
        className={`flex-1 py-2.5 px-4 rounded-xl ${
          mode === 'calendar' ? 'bg-white dark:bg-[#3D3A52]' : ''
        }`}
      >
        <Text
          className={`text-sm font-semibold text-center ${
            mode === 'calendar' ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          Calendar
        </Text>
      </Pressable>
    </View>
  );
}
