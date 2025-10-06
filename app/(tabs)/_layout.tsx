import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useEffect, useState } from 'react';

export default function TabsLayout() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const hasHydrated = useThemeStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for both mount and hydration to complete
  if (!mounted || !hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏠" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📊" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏆" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="⚙️" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, opacity: color === '#10b981' ? 1 : 0.5, marginBottom: 4 }}>
      {icon}
    </Text>
  );
}
