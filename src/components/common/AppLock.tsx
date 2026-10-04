import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, AppState, AppStateStatus } from 'react-native';
import { authenticateUser, isAppLockEnabled } from '../../services/security';

interface AppLockProps {
  children: React.ReactNode;
}

// Grace period after unlock before allowing re-lock (prevents flicker)
const UNLOCK_GRACE_PERIOD_MS = 1000;

export function AppLock({ children }: AppLockProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Track last unlock time to prevent immediate re-lock
  const lastUnlockTimeRef = useRef<number>(0);

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
          // Check if we're within the grace period after a successful unlock
          const timeSinceUnlock = Date.now() - lastUnlockTimeRef.current;
          if (timeSinceUnlock < UNLOCK_GRACE_PERIOD_MS) {
            // Within grace period, don't re-lock
            return;
          }

          // App came to foreground, lock it again
          setIsLocked(true);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [lockEnabled]);

  const handleAuthentication = useCallback(async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    const success = await authenticateUser('Unlock Seeding');
    setIsAuthenticating(false);

    if (success) {
      lastUnlockTimeRef.current = Date.now();
      setIsLocked(false);
    }
  }, [isAuthenticating]);

  // If lock is not enabled, show children directly
  if (!lockEnabled || !isLocked) {
    return <>{children}</>;
  }

  // Show lock screen
  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      <View className="items-center">
        <Text className="font-regular text-6xl mb-6">🔒</Text>
        <Text className="text-2xl font-bold text-fg mb-2">Seeding</Text>
        <Text className="font-regular text-muted text-center mb-8">
          Authenticate to access your data
        </Text>

        <Pressable
          onPress={handleAuthentication}
          disabled={isAuthenticating}
          className="bg-primary rounded-xl px-8 py-4 active:bg-primary-ink"
        >
          <Text className="text-lg font-semibold text-primary-on">
            {isAuthenticating ? 'Authenticating...' : 'Unlock'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
