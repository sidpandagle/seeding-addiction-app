import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Lock } from 'lucide-react-native';
import { usePremium } from '../../hooks/usePremium';
import { PaywallModal } from './PaywallModal';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
  showPaywall?: boolean;
}

/**
 * Component that gates premium features
 * Shows children if user has premium, otherwise shows upgrade prompt
 *
 * @example
 * ```tsx
 * <PremiumGate featureName="Advanced Analytics">
 *   <AdvancedAnalytics />
 * </PremiumGate>
 * ```
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  fallback,
  featureName = 'This feature',
  showPaywall = true,
}) => {
  const { isPremium, isLoading } = usePremium();
  const [paywallVisible, setPaywallVisible] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-purple-100 dark:bg-purple-900/20 rounded-2xl p-8 items-center max-w-md">
        <View className="bg-purple-200 dark:bg-purple-800/30 rounded-full p-4 mb-4">
          <Lock size={32} color="#8B5CF6" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Premium Feature
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {featureName} is available for premium users only
        </Text>

        {showPaywall && (
          <>
            <TouchableOpacity
              onPress={() => setPaywallVisible(true)}
              className="bg-purple-600 rounded-xl px-8 py-4 w-full mb-3"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Upgrade to Premium
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 dark:text-gray-500 text-sm text-center">
              Unlock all premium features
            </Text>
          </>
        )}
      </View>

      {showPaywall && (
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
        />
      )}
    </View>
  );
};
