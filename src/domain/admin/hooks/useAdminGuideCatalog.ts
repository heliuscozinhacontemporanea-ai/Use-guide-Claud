import { useCallback, useEffect, useState } from 'react';
import {
  type GuideItem,
  type GuideManagementCatalogSnapshot,
  subscribeGuideManagementCatalogUseCase,
} from '../../guide';

export function useAdminGuideCatalog(enabled: boolean) {
  const [items, setItems] = useState<GuideItem[]>([]);
  const [events, setEvents] = useState<GuideItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  // attempt não é lido no efeito: serve apenas para reabrir a assinatura em tempo real após erro
  // biome-ignore lint/correctness/useExhaustiveDependencies: gatilho de nova tentativa
  useEffect(() => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    return subscribeGuideManagementCatalogUseCase(
      undefined,
      ({ items: nextItems, events: nextEvents }: GuideManagementCatalogSnapshot) => {
        setItems(nextItems);
        setEvents(nextEvents);
        setIsLoading(false);
      },
      (err: Error) => {
        console.error('[useAdminGuideCatalog]', err);
        setError('Não foi possível carregar o conteúdo do guia.');
        setIsLoading(false);
      }
    );
  }, [enabled, attempt]);

  return { items, events, isLoading, error, retry };
}

