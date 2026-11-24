import { create } from 'zustand';
import { toast } from 'sonner';
import type { ConfirmDialogData, ConfirmDialogTone } from '../../ui/components/ConfirmDialog';

export type ToastType = 'success' | 'error' | 'info';
export type LoginModalTab = 'login' | 'register' | 'forgot';

/** Linha no alto da folha de acesso: de onde a pessoa veio e para onde volta (D35). Chave i18n. */
export interface LoginNote {
  key: string;
  values?: Record<string, string>;
}

export interface UIState {
  isLoginModalOpen: boolean;
  loginModalTab: LoginModalTab;
  loginNote: LoginNote | null;
  confirmDialog: ConfirmDialogData | null;
  openLoginModal: () => void;
  /** Abre o acesso numa aba, com a linha de contexto (convite do parceiro, "Sou o dono"). */
  openLoginWithNote: (tab: 'login' | 'register', note: LoginNote) => void;
  /** Abre o modal direto em "esqueci minha senha". */
  openPasswordRecovery: () => void;
  closeLoginModal: () => void;
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (
    message: string,
    options?: { tone?: ConfirmDialogTone; confirmLabel?: string }
  ) => Promise<boolean>;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  loginModalTab: 'login',
  loginNote: null,
  confirmDialog: null,

  openLoginModal: () => set({ isLoginModalOpen: true, loginModalTab: 'login', loginNote: null }),
  openLoginWithNote: (tab, note) =>
    set({ isLoginModalOpen: true, loginModalTab: tab, loginNote: note }),
  openPasswordRecovery: () =>
    set({ isLoginModalOpen: true, loginModalTab: 'forgot', loginNote: null }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  showToast: (message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast.info(message);
        break;
    }
  },

  confirmAction: (message, options) => {
    return new Promise((resolve) => {
      set({
        confirmDialog: {
          message,
          ...options,
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
  const confirmDialog = useUIStore((state) => state.confirmDialog);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const openLoginWithNote = useUIStore((state) => state.openLoginWithNote);
  const closeLoginModal = useUIStore((state) => state.closeLoginModal);
  const showToast = useUIStore((state) => state.showToast);
  const confirmAction = useUIStore((state) => state.confirmAction);
  const closeConfirmDialog = useUIStore((state) => state.closeConfirmDialog);

  return {
    isLoginModalOpen,
    confirmDialog,
    openLoginModal,
    openLoginWithNote,
    closeLoginModal,
    showToast,
    confirmAction,
    closeConfirmDialog,
  };
};
