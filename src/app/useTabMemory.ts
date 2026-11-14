import { useCallback, useEffect, useRef } from 'react';
import type { Location } from 'react-router-dom';

/** Parâmetros que formam "a página aberta" numa aba (o anúncio ou o evento em tela cheia). */
const PAGE_PARAMS = ['item', 'type'] as const;

/**
 * Cada aba da barra inferior guarda a página que estava aberta nela (DESIGN.md P23): sair e voltar
 * para a aba devolve o anúncio aberto. A rolagem de cada aba já é guardada por `useScrollContainer`.
 */
export function useTabMemory(location: Location) {
  const memory = useRef<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kept = new URLSearchParams();
    for (const key of PAGE_PARAMS) {
      const value = params.get(key);
      if (value) kept.set(key, value);
    }
    const search = kept.toString();
    memory.current[location.pathname] = search ? `?${search}` : '';
  }, [location.pathname, location.search]);

  return useCallback((pathname: string) => memory.current[pathname] ?? '', []);
}
