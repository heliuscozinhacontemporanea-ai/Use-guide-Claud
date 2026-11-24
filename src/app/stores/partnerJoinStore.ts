import { create } from 'zustand';

interface PartnerJoinState {
  /** O Seja parceiro está aberto: ele mesmo pede a confirmação do e-mail (D34, D35). */
  active: boolean;
  setActive: (active: boolean) => void;
  /**
   * A conta está sendo criada pelo convite "Tem um negócio?" (D35, item 9): depois do @, o Seja
   * parceiro abre sozinho. Quem cria conta por outro caminho fica com uma conta comum.
   */
  invited: boolean;
  setInvited: (invited: boolean) => void;
}

export const usePartnerJoinStore = create<PartnerJoinState>((set) => ({
  active: false,
  setActive: (active) => set({ active }),
  invited: false,
  setInvited: (invited) => set({ invited }),
}));
