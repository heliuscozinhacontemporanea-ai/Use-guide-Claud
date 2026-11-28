import { useCallback, useEffect, useRef } from 'react';
import type { Location } from 'react-router-dom';
import { type NavTab, tabOfRoute } from '../shared/constants/navigation';
import { parseLocalizedPath, type RouteKey } from '../shared/i18n';

/** Parâmetros que formam "a página aberta" numa aba (o anúncio ou o evento em tela cheia). */
const PAGE_PARAMS = ['item', 'type'] as const;

export interface TabPlace {
  routeKey: RouteKey;
  search: string;
}

/**
 * Cada aba da barra inferior guarda onde estava (DESIGN.md P23): a pílula escolhida e o anúncio
 * aberto. Guarda a chave da rota, e não o caminho, para seguir o idioma ativo. A rolagem de cada
 * página já é guardada por `useScrollContainer`.
 */
export function useTabMemory(location: Location) {
  const memory = useRef<Partial<Record<NavTab, TabPlace>>>({});

  useEffect(() => {
    const parsed = parseLocalizedPath(location.pathname);
    const tab = tabOfRoute(parsed?.routeKey ?? null);
    if (!parsed || !tab) return;
    const params = new URLSearchParams(location.search);
    const kept = new URLSearchParams();
    for (const key of PAGE_PARAMS) {
      const value = params.get(key);
      if (value) kept.set(key, value);
    }
    const search = kept.toString();
    memory.current[tab] = { routeKey: parsed.routeKey, search: search ? `?${search}` : '' };
  }, [location.pathname, location.search]);

  return useCallback((tab: NavTab): TabPlace | null => memory.current[tab] ?? null, []);
}
