import { createContext, useContext } from 'react';

/**
 * "Nenhuma destas" nas listas de múltipla escolha do guia de passos (D34): a lista vazia conta como
 * respondida só quando a pessoa marca a opção. Fora do guia (editor do Catálogo) não há contexto e a
 * opção não aparece.
 */
export interface NoneOfThese {
  isNone: (key: string) => boolean;
  setNone: (key: string, none: boolean) => void;
}

export const NoneOfTheseContext = createContext<NoneOfThese | null>(null);

export function useNoneOfThese(): NoneOfThese | null {
  return useContext(NoneOfTheseContext);
}
