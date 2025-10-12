import { Tabs } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { Home, History, Trophy, Settings } from 'lucide-react-native';

export default function TabsLayout() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#8FB79C' : '#6B9A7F',
        tabBarInactiveTintColor: isDark ? '#6B6B78' : '#9E9E9E',
        tabBarStyle: {
          backgroundColor: isDark ? '#252336' : '#FFFFFF',
          borderTopColor: isDark ? '#2F2D42' : '#F5F5F5',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_500Medium',
          marginTop: 4,
          letterSpacing: 0.25,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <History size={22} color={color} strokeWidth={focused ? 2.5 : 2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={22} color={color} strokeWidth={focused ? 2.5 : 2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
