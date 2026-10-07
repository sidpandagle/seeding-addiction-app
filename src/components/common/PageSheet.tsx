import type { ReactNode } from 'react';
import { Modal, StatusBar } from 'react-native';
import { useColorScheme } from '../../stores/themeStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PageSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Full-screen sheet that slides up over a tab.
 * On Android a Modal is its own window and can come up with white status bar icons,
 * invisible on a light sheet. A <StatusBar> inside it doesn't help: its style matches the
 * tab behind, so nothing is sent. Set the style again once the sheet is on screen.
 */
export function PageSheet({ visible, onClose, children }: PageSheetProps) {
  const colorScheme = useColorScheme();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? 'none' : 'slide'}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content')}
    >
      {children}
    </Modal>
  );
}
