import { useState, useEffect } from 'react';
import { View, Text, Pressable, AppState, AppStateStatus } from 'react-native';
import { authenticateUser, isAppLockEnabled } from '../services/security';

interface AppLockProps {
  children: React.ReactNode;
}

export function AppLock({ children }: AppLockProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if app lock is enabled on mount
  useEffect(() => {
    const checkLockStatus = async () => {
      const enabled = await isAppLockEnabled();
      setLockEnabled(enabled);

      if (enabled) {
        // Try to authenticate immediately if lock is enabled
        await handleAuthentication();
      } else {
        // No lock, unlock immediately
        setIsLocked(false);
      }
    };

    checkLockStatus();
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && lockEnabled) {
          // App came to foreground, lock it again
          setIsLocked(true);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [lockEnabled]);

  const handleAuthentication = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    const success = await authenticateUser('Unlock Seeding');
    setIsAuthenticating(false);

    if (success) {
      setIsLocked(false);
    }
  };

  // If lock is not enabled, show children directly
  if (!lockEnabled || !isLocked) {
    return <>{children}</>;
  }

  // Show lock screen
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
      <View className="items-center">
        <Text className="text-6xl mb-6">🔒</Text>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seeding</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Authenticate to access your data
        </Text>

        <Pressable
          onPress={handleAuthentication}
          disabled={isAuthenticating}
          className="bg-emerald-600 dark:bg-emerald-700 rounded-xl px-8 py-4 active:bg-emerald-700 dark:active:bg-emerald-800"
        >
          <Text className="text-white font-semibold text-lg">
            {isAuthenticating ? 'Authenticating...' : 'Unlock'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
