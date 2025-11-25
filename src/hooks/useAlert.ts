import { useState, useCallback } from 'react';
import { AlertType, AlertButton } from '../components/common/CustomAlert';

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  dismissOnBackdrop?: boolean;
}

export interface AlertState extends AlertConfig {
  visible: boolean;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertState({ visible: true, ...config });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  return {
    alertState,
    showAlert,
    hideAlert,
  };
};
