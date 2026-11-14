import { useSyncExternalStore } from 'react';

const KEY = 'ugPages';

function markers(): string[] {
  const state = window.history.state as Record<string, unknown> | null;
  const value = state?.[KEY];
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Páginas abertas por cima de uma tela, guardadas fora do React (`usePageStack` lê). */
export interface PageStack<T> {
  push: (page: T) => void;
  /** Fecha a página de cima: pelo histórico, se a entrada dela for a atual. */
  back: () => void;
  getPages: () => readonly T[];
  subscribe: (listener: () => void) => () => void;
}

/**
 * Pilha de páginas com entrada no histórico (DESIGN.md P19): o voltar do Android, o gesto do iPhone e
 * o voltar do navegador fecham a de cima. A entrada repete a URL e o estado do React Router e só
 * acrescenta a marca da página.
 *
 * Fica fora do componente da tela de base de propósito: abrir ou fechar uma página só redesenha quem
 * monta a pilha, não a tela inteira (no painel do parceiro, isso tirava um quadro longo de cada troca).
 */
export function createPageStack<T>(scope: string): PageStack<T> {
  let pages: readonly T[] = [];
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const depth = () => markers().filter((marker) => marker.startsWith(`${scope}#`)).length;
  const onPop = () => {
    const open = depth();
    if (pages.length > open) {
      pages = pages.slice(0, open);
      emit();
    }
  };

  return {
    push(page) {
      const state = (window.history.state as Record<string, unknown> | null) ?? {};
      window.history.pushState(
        { ...state, [KEY]: [...markers(), `${scope}#${pages.length + 1}`] },
        ''
      );
      pages = [...pages, page];
      emit();
    },
    back() {
      if (markers().at(-1)?.startsWith(`${scope}#`)) {
        window.history.back();
        return;
      }
      pages = pages.slice(0, -1);
      emit();
    },
    getPages: () => pages,
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener('popstate', onPop);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('popstate', onPop);
      };
    },
  };
}

/** Páginas abertas agora; redesenha só o componente que chama. */
export function usePageStack<T>(stack: PageStack<T>): readonly T[] {
  return useSyncExternalStore(stack.subscribe, stack.getPages, stack.getPages);
}
