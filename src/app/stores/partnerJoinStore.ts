import { create } from 'zustand';

interface PartnerJoinState {
  /** O Seja parceiro está aberto: ele mesmo pede o @ e a confirmação do e-mail (D34). */
  active: boolean;
  setActive: (active: boolean) => void;
}

export const usePartnerJoinStore = create<PartnerJoinState>((set) => ({
  active: false,
  setActive: (active) => set({ active }),
}));
