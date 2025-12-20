import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Star, Calendar, RefreshCw, CreditCard, AlertTriangle } from 'lucide-react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import CustomAlert from '../common/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import ConfirmationDialog from '../common/ConfirmationDialog';

interface CustomerCenterProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomerCenter: React.FC<CustomerCenterProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    isPremium,
    selectedPlan,
    expirationDate,
    willRenew,
    cancelSubscription,
    logout,
  } = useSubscriptionStore();
  const { alertState, showAlert, hideAlert } = useAlert();
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = () => {
    cancelSubscription();
    setShowCancelDialog(false);
    showAlert({
      type: 'info',
      title: 'Subscription Cancelled',
      message: 'Your subscription will not renew. You will retain access until the current period ends.',
      buttons: [{ text: 'OK', onPress: hideAlert }],
    });
  };

  const handleRemoveAccess = () => {
    logout();
    showAlert({
      type: 'success',
      title: 'Access Removed',
      message: 'Premium access has been removed for testing purposes.',
      buttons: [{ text: 'OK', onPress: () => { hideAlert(); onClose(); } }],
    });
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
            Manage Subscription
          </Text>
          <Pressable
            onPress={onClose}
            className="items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Status Card */}
          <View className="mt-4 overflow-hidden rounded-2xl">
            <LinearGradient
              colors={['#a855f7', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <View className="flex-row items-center mb-4">
                <View className="items-center justify-center w-14 h-14 mr-4 rounded-full bg-white/20">
                  <Crown size={28} color="#fff" fill="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white">
                    Seeding Pro
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text className="ml-1 text-sm text-purple-100">
                      {isPremium ? 'Active Subscription' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedPlan && (
                <View className="p-3 rounded-xl bg-white/10">
                  <Text className="text-xs font-semibold text-purple-100">
                    Current Plan
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-white">
                    {selectedPlan.name} - {selectedPlan.price}/{selectedPlan.period}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Subscription Details */}
          <View className="mt-6">
            <Text className={`text-sm font-bold tracking-wider uppercase mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Subscription Details
            </Text>

            <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {/* Expiration Date */}
              <View className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <Calendar size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {willRenew ? 'Renews on' : 'Expires on'}
                  </Text>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(expirationDate)}
                  </Text>
                </View>
              </View>

              {/* Renewal Status */}
              <View className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-green-50 dark:bg-green-900/30">
                  <RefreshCw size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Auto-Renewal
                  </Text>
                  <Text className={`font-semibold ${willRenew ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                    {willRenew ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>

              {/* Payment Method (Mock) */}
              <View className="flex-row items-center p-4">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-purple-50 dark:bg-purple-900/30">
                  <CreditCard size={20} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Payment Method
                  </Text>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Mock Payment (Development)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-6">
            <Text className={`text-sm font-bold tracking-wider uppercase mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Actions
            </Text>

            <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {/* Cancel Subscription */}
              {willRenew && (
                <Pressable
                  onPress={handleCancelSubscription}
                  className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} active:opacity-70`}
                >
                  <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
                    <AlertTriangle size={20} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Cancel Auto-Renewal
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Keep access until expiration
                    </Text>
                  </View>
                </Pressable>
              )}

              {/* Remove Access (Dev only) */}
              <Pressable
                onPress={handleRemoveAccess}
                className="flex-row items-center p-4 active:opacity-70"
              >
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-red-50 dark:bg-red-900/30">
                  <X size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-red-600 dark:text-red-400">
                    Remove Premium Access
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    For testing (dev mode only)
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Development Notice */}
          <View className="mt-6">
            <View className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <Text className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Development Mode
              </Text>
              <Text className={`mt-1 text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                This is a mock subscription management screen. In production, this will connect to the App Store or Google Play for real subscription management.
              </Text>
            </View>
          </View>
        </ScrollView>

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

        {/* Cancel Confirmation Dialog */}
        <ConfirmationDialog
          visible={showCancelDialog}
          title="Cancel Auto-Renewal"
          message="Your subscription will not renew automatically. You'll keep premium access until the current billing period ends."
          confirmText="Cancel Renewal"
          cancelText="Keep Subscription"
          onConfirm={confirmCancelSubscription}
          onCancel={() => setShowCancelDialog(false)}
          isDestructive={false}
        />
      </View>
    </Modal>
  );
};
