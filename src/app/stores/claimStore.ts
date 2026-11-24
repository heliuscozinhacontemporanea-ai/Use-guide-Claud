import { create } from 'zustand';
import type { ClaimTarget } from '../../domain/partners';

interface ClaimState {
  /** Lugar do pedido aberto na folha "Assumir anúncio" (D35). */
  target: ClaimTarget | null;
  /** Lugar escolhido sem conta: a folha abre depois do login e do @ (D35, 4a). */
  waiting: ClaimTarget | null;
  open: (target: ClaimTarget) => void;
  wait: (target: ClaimTarget | null) => void;
  close: () => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  target: null,
  waiting: null,
  open: (target) => set({ target, waiting: null }),
  wait: (waiting) => set({ waiting }),
  close: () => set({ target: null }),
}));
