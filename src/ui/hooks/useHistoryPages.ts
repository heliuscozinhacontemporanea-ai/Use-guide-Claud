import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'ugPages';

function markers(): string[] {
  const state = window.history.state as Record<string, unknown> | null;
  const value = state?.[KEY];
  return Array.isArray(value) ? (value as string[]) : [];
}

function depthOf(scope: string): number {
  return markers().filter((marker) => marker.startsWith(`${scope}#`)).length;
}

/**
 * Páginas abertas por cima de uma tela (DESIGN.md P19): cada página nova ganha uma entrada no
 * histórico, e o voltar do Android, o gesto do iPhone e o voltar do navegador fecham a de cima.
 * A entrada repete a URL e o estado do React Router e só acrescenta a marca da página.
 */
export function useHistoryPages<T extends string>(scope: string) {
  const [pages, setPages] = useState<T[]>([]);
  const count = useRef(0);
  count.current = pages.length;

  useEffect(() => {
    const onPop = () => {
      const depth = depthOf(scope);
      setPages((current) => (current.length > depth ? current.slice(0, depth) : current));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [scope]);

  const push = useCallback(
    (page: T) => {
      // Fora do atualizador do estado: o StrictMode o chama duas vezes e criaria duas entradas.
      const state = (window.history.state as Record<string, unknown> | null) ?? {};
      count.current += 1;
      window.history.pushState(
        { ...state, [KEY]: [...markers(), `${scope}#${count.current}`] },
        ''
      );
      setPages((current) => [...current, page]);
    },
    [scope]
  );

  /** Fecha a página de cima: pelo histórico, se a entrada dela for a atual. */
  const back = useCallback(() => {
    if (markers().at(-1)?.startsWith(`${scope}#`)) {
      window.history.back();
      return;
    }
    setPages((current) => current.slice(0, -1));
  }, [scope]);

  return { pages, top: pages.at(-1) ?? null, push, back };
}
