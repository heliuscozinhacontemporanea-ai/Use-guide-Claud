import { useSyncExternalStore } from 'react';
import type { GuideItem } from '../../../domain/guide';

/**
 * O catálogo que a aba "Guia local" já assina, para as páginas do anúncio lerem sem abrir outra escuta
 * do Firestore. `version` sobe quando um bloco é salvo ou o anúncio é publicado: o editor relê os passos.
 */
let items: readonly GuideItem[] = [];
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  for (const listener of listeners) listener();
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function setAdminGuideItems(next: readonly GuideItem[]): void {
  items = next;
  emit();
}

export function bumpAdminListingVersion(): void {
  version += 1;
  emit();
}

export function useAdminGuideItems(): readonly GuideItem[] {
  return useSyncExternalStore(
    subscribe,
    () => items,
    () => items
  );
}

export function useAdminListingVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version
  );
}
