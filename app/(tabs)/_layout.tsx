import { Tabs } from 'expo-router';
import { useColorScheme } from '../../src/stores/themeStore';
import { Home, History, Trophy, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Memoize screen options to prevent recalculation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: '#10b981',
    tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
    tabBarStyle: {
      backgroundColor: colorScheme === 'dark' ? '#030712 ' : '#ffffff',
      borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      height: 70 + insets.bottom,
      paddingBottom: Math.max(insets.bottom, 10),
      paddingTop: 5,
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
    // Set background color for screen container to prevent white flash
    // Using Tailwind gray-950 (dark) and gray-50 (light) via RGB values
    sceneStyle: {
      backgroundColor: colorScheme === 'dark' ? 'rgb(3, 7, 18)' : 'rgb(249, 250, 251)',
    },
    // Performance optimizations for faster tab switching
    lazy: false, // Preload all tabs to eliminate mounting delays
    unmountOnBlur: false, // Keep screens mounted for instant switching
    freezeOnBlur: true, // Freeze inactive screens to save resources
    // animation: 'fade' as const, // Fade transition is smoother and less prone to white flashes
  }), [colorScheme, insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <History size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
