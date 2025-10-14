import { Tabs } from 'expo-router';
import { useColorScheme } from '../../src/stores/themeStore';
import { Home, History, Trophy, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';

// Memoized icon components to prevent recreation on every render
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const HistoryIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <History size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const TrophyIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Trophy size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const SettingsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Memoize screen options to prevent recalculation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: '#10b981',
    tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
    tabBarStyle: {
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
      borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      borderTopWidth: 1,
      height: 70 + insets.bottom,
      paddingBottom: Math.max(insets.bottom, 10),
      paddingTop: 10,
    },
    tabBarItemStyle: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontFamily: 'Poppins_600SemiBold',
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginTop: 2,
    },
  }), [colorScheme, insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: HistoryIcon,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: TrophyIcon,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tabs>
  );
}
