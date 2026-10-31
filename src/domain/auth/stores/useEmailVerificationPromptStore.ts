import { create } from 'zustand';

export type EmailVerificationPromptReason = 'signup' | 'required';

interface EmailVerificationPromptState {
  reason: EmailVerificationPromptReason | null;
  /** Último envio do link, para a espera entre envios valer mesmo com o aviso fechado. */
  sentAt: number | null;
  open: (reason: EmailVerificationPromptReason) => void;
  close: () => void;
  markSent: (at: number) => void;
}

/** Aviso "Confirme seu e-mail" aberto depois do cadastro ou quando uma ação exige (D22). */
export const useEmailVerificationPromptStore = create<EmailVerificationPromptState>((set) => ({
  reason: null,
  sentAt: null,
  open: (reason) => set({ reason }),
  close: () => set({ reason: null }),
  markSent: (sentAt) => set({ sentAt }),
}));
