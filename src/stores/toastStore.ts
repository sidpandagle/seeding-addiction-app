import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
  durationMs: number;
}

interface ToastState {
  toast: Toast | null;
  showToast: (message: string, options?: { action?: ToastAction; durationMs?: number }) => void;
  hideToast: (id?: number) => void;
}

const DEFAULT_DURATION_MS = 4000;
let nextId = 1;

/**
 * One toast at a time, shown above the tab bar by ToastHost.
 * Any screen or modal can show one; a newer toast replaces the current one.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  toast: null,
  showToast: (message, options) =>
    set({
      toast: {
        id: nextId++,
        message,
        action: options?.action,
        durationMs: options?.durationMs ?? DEFAULT_DURATION_MS,
      },
    }),
  hideToast: (id) => {
    // Ignore a stale timer hiding a newer toast
    if (id !== undefined && get().toast?.id !== id) return;
    set({ toast: null });
  },
}));
