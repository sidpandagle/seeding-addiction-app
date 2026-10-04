import { Platform, type ViewStyle } from 'react-native';
import { useColorScheme } from '../stores/themeStore';
import { palette, type ThemeColors } from '../constants/palette';

/**
 * Theme colors as hex strings, for props that can't take a className:
 * icon colors, the tab bar, RefreshControl, charts and inline styles.
 */
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return palette[colorScheme];
}

const CARD_SHADOW = Platform.select<ViewStyle>({
  ios: { shadowColor: '#141E14', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  default: { elevation: 1 },
});

/**
 * Soft card shadow for light mode. Dark mode relies on the border alone.
 * iOS clips shadows on views with overflow-hidden, so put it on an outer view.
 */
export function useCardShadow(): ViewStyle | undefined {
  return useColorScheme() === 'dark' ? undefined : CARD_SHADOW;
}
