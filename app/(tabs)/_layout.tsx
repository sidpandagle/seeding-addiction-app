import { Tabs } from 'expo-router';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Home, History, Trophy, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { AnimatedTabBarIcon } from '../../src/components/navigation/AnimatedTabBarIcon';
import { ToastHost } from '../../src/components/common/ToastHost';
import { View } from 'react-native';

export default function TabsLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  
  // Matches the screen backgrounds (bg-bg)
  const backgroundColor = colors.bg;

  // Tab bar height, also used to place toasts just above it
  const tabBarHeight = 70 + insets.bottom;

  // Memoize screen options to prevent recalculation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: {
      backgroundColor: colors.tab,
      borderTopColor: colors.border,
      height: tabBarHeight,
      paddingBottom: Math.max(insets.bottom, 10),
      paddingTop: 5,
    },
    tabBarItemStyle: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontFamily: 'Nunito_700Bold',
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginTop: 2,
    },
    // Set background color for screen container to prevent white flash
    sceneStyle: {
      backgroundColor,
    },
    // Content style applies earlier than sceneStyle - helps prevent white flash
    contentStyle: {
      backgroundColor,
    },
    // Performance optimizations for faster tab switching
    lazy: false, // Preload all tabs to eliminate mounting delays
    unmountOnBlur: false, // Keep screens mounted for instant switching
    freezeOnBlur: true, // Freeze inactive screens to save resources
    // No crossfade between tabs: mid-fade both screens show at half opacity, which reads as a
    // grey wash, and on Android the card elevation shadows show through the faded cards.
    animation: 'none' as const,
  }), [colors, insets.bottom, tabBarHeight, backgroundColor]);

  return (
    <View style={{ flex: 1, backgroundColor }}>
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
      <ToastHost bottomOffset={tabBarHeight + 12} />
    </View>
  );
}
