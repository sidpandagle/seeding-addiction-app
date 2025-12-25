import { Tabs } from 'expo-router';
import { useColorScheme } from '../../src/stores/themeStore';
import { Home, History, Trophy, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { AnimatedTabBarIcon } from '../../src/components/navigation/AnimatedTabBarIcon';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Memoize screen options to prevent recalculation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: '#10b981',
    tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
    tabBarStyle: {
      backgroundColor: colorScheme === 'dark' ? '#030712' : '#ffffff',
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
    // Using Tailwind gray-950 (dark) and gray-50 (light) to match tab screen backgrounds
    sceneStyle: {
      backgroundColor: colorScheme === 'dark' ? '#030712' : '#f9fafb',
    },
    // Performance optimizations for faster tab switching
    lazy: false, // Preload all tabs to eliminate mounting delays
    unmountOnBlur: false, // Keep screens mounted for instant switching
    freezeOnBlur: true, // Freeze inactive screens to save resources
    animation: 'none' as const, // Disable animation to prevent potential white flashes during transitions
  }), [colorScheme, insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon Icon={History} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon Icon={Trophy} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon Icon={Settings} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
