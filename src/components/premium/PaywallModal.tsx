import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Check, Crown, Sparkles, Star } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { SUBSCRIPTION_PLANS, PREMIUM_FEATURES, SubscriptionPlan } from '../../config/subscriptionPlans';
import CustomAlert from '../common/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { purchasePlan, restorePurchases, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    SUBSCRIPTION_PLANS.find((p) => p.popular) || SUBSCRIPTION_PLANS[1]
  );
  const { alertState, showAlert, hideAlert } = useAlert();

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    const success = await purchasePlan(selectedPlan);

    if (success) {
      showAlert({
        type: 'success',
        title: 'Welcome to Seeding Pro!',
        message: 'All premium features are now unlocked. Thank you for your support!',
        buttons: [{ text: 'OK', onPress: () => { hideAlert(); onClose(); } }],
      });
    } else {
      showAlert({
        type: 'error',
        title: 'Purchase Failed',
        message: 'Something went wrong. Please try again later.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();

    if (success) {
      showAlert({
        type: 'success',
        title: 'Purchases Restored',
        message: 'Your premium access has been restored!',
        buttons: [{ text: 'OK', onPress: () => { hideAlert(); onClose(); } }],
      });
    } else {
      showAlert({
        type: 'info',
        title: 'No Purchases Found',
        message: 'We could not find any previous purchases to restore.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <View className="w-10" />
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upgrade to Pro
          </Text>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Hero Section */}
          <View className="items-center px-6 pt-4 pb-6">
            <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Crown size={40} color="#fff" fill="#fff" />
            </View>
            <Text className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Seeding Pro
            </Text>
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Unlock powerful insights to accelerate your recovery journey
            </Text>
          </View>

          {/* Features List */}
          <View className="px-6 mb-6">
            <View className={`p-4 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {PREMIUM_FEATURES.map((feature, index) => (
                <View
                  key={index}
                  className={`flex-row items-center py-3 ${
                    index < PREMIUM_FEATURES.length - 1
                      ? `border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`
                      : ''
                  }`}
                >
                  <View className="items-center justify-center w-8 h-8 mr-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Check size={18} color="#a855f7" strokeWidth={3} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Plan Selection */}
          <View className="px-6 mb-6">
            <Text className={`text-sm font-bold tracking-wider uppercase mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose Your Plan
            </Text>
            <View className="gap-3">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan)}
                  className={`p-4 rounded-2xl border-2 ${
                    selectedPlan?.id === plan.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : isDark
                      ? 'border-gray-800 bg-gray-900'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </Text>
                        {plan.popular && (
                          <View className="flex-row items-center px-2 py-0.5 bg-purple-500 rounded-full">
                            <Star size={12} color="#fff" fill="#fff" />
                            <Text className="ml-1 text-xs font-bold text-white">Popular</Text>
                          </View>
                        )}
                        {plan.savings && !plan.popular && (
                          <View className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Text className="text-xs font-bold text-green-600 dark:text-green-400">
                              {plan.savings}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.description}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plan.price}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.periodLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Selection indicator */}
                  <View className="absolute top-4 right-4">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedPlan?.id === plan.id
                          ? 'border-purple-500 bg-purple-500'
                          : isDark
                          ? 'border-gray-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan?.id === plan.id && (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Development Notice */}
          <View className="px-6 mb-4">
            <View className={`p-3 rounded-xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <View className="flex-row items-center">
                <Sparkles size={16} color="#f59e0b" />
                <Text className={`ml-2 text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Development Mode
                </Text>
              </View>
              <Text className={`mt-1 text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                Purchases are simulated for testing. No real charges will be made.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Purchase Section */}
        <View className={`px-6 pt-4 pb-8 border-t ${isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading || !selectedPlan}
            className={`py-4 rounded-2xl items-center justify-center ${
              isLoading
                ? isDark
                  ? 'bg-gray-800'
                  : 'bg-gray-300'
                : 'bg-purple-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">
                Continue with {selectedPlan?.name} - {selectedPlan?.price}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleRestore}
            disabled={isLoading}
            className="items-center py-3 mt-2"
          >
            <Text className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              Restore Purchases
            </Text>
          </Pressable>

          <Text className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Cancel anytime. Subscriptions auto-renew unless cancelled.
          </Text>
        </View>

        {/* Custom Alert */}
        {alertState && (
          <CustomAlert
            visible={alertState.visible}
            type={alertState.type}
            title={alertState.title}
            message={alertState.message}
            buttons={alertState.buttons}
            onDismiss={hideAlert}
          />
        )}
      </View>
    </Modal>
  );
};
