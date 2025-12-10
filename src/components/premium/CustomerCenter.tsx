import React from 'react';
import { Modal } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

interface CustomerCenterProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * CustomerCenter using RevenueCat's pre-built Customer Center UI
 * This provides a self-service interface for users to manage their subscriptions,
 * including viewing status, changing plans, and cancelling
 */
export const CustomerCenter: React.FC<CustomerCenterProps> = ({
  visible,
  onClose,
}) => {
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
      <RevenueCatUI.CustomerCenter
        options={{
          dismissRequest: onClose,
        }}
        onDismiss={() => {
          console.log('[CustomerCenter] Dismissed');
          onClose();
        }}
      />
    </Modal>
  );
};
