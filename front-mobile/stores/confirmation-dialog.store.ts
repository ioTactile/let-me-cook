import { create } from 'zustand';

interface ConfirmationDialogState {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  showDialog: (title: string, message: string, onConfirm: () => void) => void;
  hideDialog: () => void;
}

export const useConfirmationDialogStore = create<ConfirmationDialogState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  onConfirm: null,
  showDialog: (title, message, onConfirm) => set({ isVisible: true, title, message, onConfirm }),
  hideDialog: () => set({ isVisible: false, title: '', message: '', onConfirm: null }),
}));
