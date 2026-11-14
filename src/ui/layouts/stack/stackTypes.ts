import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Ação em ícone à direita da barra do topo (no máximo uma por tela, DESIGN.md §8). */
export interface StackAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/** Uma tela da pilha, da primeira (raiz) à de cima. */
export interface StackEntry {
  key: string;
  /** Título centralizado na barra fixa. Sem título e com `navBar: false`, a tela usa o cabeçalho próprio. */
  title?: string;
  action?: StackAction;
  /** A tela usa a barra do topo fixa da folha (D33). */
  navBar: boolean;
  render: () => ReactNode;
}
