import { create } from 'zustand';
import { toast } from 'sonner';
import { ConfirmDialogData } from '../../ui/components/ConfirmDialog';

export type ToastType = 'success' | 'error' | 'info';

export interface UIState {
  isLoginModalOpen: boolean;
  isLoginClosingBySwipe: boolean;
  confirmDialog: ConfirmDialogData | null;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setLoginClosingBySwipe: (val: boolean) => void;
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (message: string) => Promise<boolean>;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  isLoginClosingBySwipe: false,
  confirmDialog: null,

  openLoginModal: () => set({ isLoginModalOpen: true, isLoginClosingBySwipe: false }),
  closeLoginModal: () => set({ isLoginModalOpen: false, isLoginClosingBySwipe: false }),
  setLoginClosingBySwipe: (val: boolean) => set({ isLoginClosingBySwipe: val }),

  showToast: (message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  },

  confirmAction: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      set({
        confirmDialog: {
          message,
          onConfirm: () => {
            set({ confirmDialog: null });
            resolve(true);
          },
          onCancel: () => {
            set({ confirmDialog: null });
            resolve(false);
          },
        },
      });
    });
  },

  closeConfirmDialog: () => set({ confirmDialog: null }),
}));

export const useUI = () => {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
  const isLoginClosingBySwipe = useUIStore((state) => state.isLoginClosingBySwipe);
  const confirmDialog = useUIStore((state) => state.confirmDialog);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const closeLoginModal = useUIStore((state) => state.closeLoginModal);
  const setLoginClosingBySwipe = useUIStore((state) => state.setLoginClosingBySwipe);
  const showToast = useUIStore((state) => state.showToast);
  const confirmAction = useUIStore((state) => state.confirmAction);
  const closeConfirmDialog = useUIStore((state) => state.closeConfirmDialog);

  return {
    isLoginModalOpen,
    isLoginClosingBySwipe,
    confirmDialog,
    openLoginModal,
    closeLoginModal,
    setLoginClosingBySwipe,
    showToast,
    confirmAction,
    closeConfirmDialog,
  };
};
