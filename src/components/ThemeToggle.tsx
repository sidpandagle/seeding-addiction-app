import { TouchableOpacity, Text, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { getThemeColors } from '../theme/colors';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useThemeStore();
  const themeColors = getThemeColors(colorScheme);

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
      className="px-4 py-2 rounded-full border"
    >
      <Text
        style={{ color: themeColors.text.primary }}
        className="font-medium"
      >
        {colorScheme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </Text>
    </TouchableOpacity>
  );
}
