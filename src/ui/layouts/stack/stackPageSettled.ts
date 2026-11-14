import { createContext, useContext, useSyncExternalStore } from 'react';

/**
 * Se a página da pilha já parou no lugar alguma vez. Avisa só nessa primeira vez: as outras trocas de
 * papel (arraste, voltar) não redesenham quem acompanha.
 */
export interface StackPageSettledStore {
  get: () => boolean;
  subscribe: (listener: () => void) => () => void;
  /** A página está (ou não) parada agora. */
  set: (settled: boolean) => void;
}

export function createStackPageSettledStore(initial: boolean): StackPageSettledStore {
  let settled = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => settled,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      if (!next || settled) return;
      settled = true;
      for (const listener of listeners) listener();
    },
  };
}

export const StackPageSettledContext = createContext<StackPageSettledStore | null>(null);

const always = () => true;
const noSubscription = () => () => {};

/**
 * A página já terminou de entrar (D33). Conteúdo pesado que chega no meio do deslize (gráfico, lista
 * longa) espera por isto: desenhado com a página parada, não trava nenhum quadro da animação. Fora da
 * pilha, sempre verdadeiro.
 */
export function useStackPageSettled(): boolean {
  const store = useContext(StackPageSettledContext);
  return useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    store?.get ?? always,
    store?.get ?? always
  );
}
