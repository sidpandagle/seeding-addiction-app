import React from 'react';
import { Modal, Alert } from 'react-native';
import RevenueCatUI, {
  PAYWALL_RESULT,
} from 'react-native-purchases-ui';
import { useSubscriptionStore } from '../../stores/subscriptionStore';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * PaywallModal using RevenueCat's pre-built Paywall UI
 * This provides a beautiful, pre-designed paywall that you can customize
 * in the RevenueCat dashboard without code changes
 */
export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
}) => {
  const { refreshCustomerInfo } = useSubscriptionStore();

  const handlePaywallResult = async (result: PAYWALL_RESULT) => {
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        // Refresh customer info to update premium status
        await refreshCustomerInfo();
        Alert.alert(
          'Success!',
          'Welcome to Seeding Pro! All premium features are now unlocked.',
          [{ text: 'OK', onPress: onClose }]
        );
        break;

      case PAYWALL_RESULT.CANCELLED:
        // User cancelled, just close
        onClose();
        break;

      case PAYWALL_RESULT.ERROR:
        Alert.alert(
          'Error',
          'Something went wrong. Please try again later.',
          [{ text: 'OK' }]
        );
        break;

      case PAYWALL_RESULT.NOT_PRESENTED:
        console.log('[Paywall] Not presented');
        break;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <RevenueCatUI.Paywall
        options={{
          dismissRequest: onClose,
        }}
        onPurchaseCompleted={({ customerInfo }) => {
          console.log('[Paywall] Purchase completed:', customerInfo);
          handlePaywallResult(PAYWALL_RESULT.PURCHASED);
        }}
        onRestoreCompleted={({ customerInfo }) => {
          console.log('[Paywall] Restore completed:', customerInfo);
          handlePaywallResult(PAYWALL_RESULT.RESTORED);
        }}
        onDismiss={() => {
          console.log('[Paywall] Dismissed');
          handlePaywallResult(PAYWALL_RESULT.CANCELLED);
        }}
        onPurchaseError={({ error }) => {
          console.error('[Paywall] Purchase error:', error);
          if (!error.userCancelled) {
            handlePaywallResult(PAYWALL_RESULT.ERROR);
          } else {
            onClose();
          }
        }}
        onRestoreError={({ error }) => {
          console.error('[Paywall] Restore error:', error);
          Alert.alert(
            'Restore Failed',
            'We could not find any previous purchases to restore.',
            [{ text: 'OK' }]
          );
        }}
      />
    </Modal>
  );
};
