import { create } from 'zustand';
import { SnackbarType } from '@/components/Snackbar';

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  showSnackbar: (message, type = 'info') =>
    set({
      visible: true,
      message,
      type,
    }),
  hideSnackbar: () =>
    set((state) => ({
      ...state,
      visible: false,
    })),
}));
