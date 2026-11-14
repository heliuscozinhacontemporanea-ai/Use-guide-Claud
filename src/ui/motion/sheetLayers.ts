import { useLayoutEffect, useSyncExternalStore } from 'react';

/**
 * Folhas abertas, da de baixo para a de cima (DESIGN.md §9.1, D33). A de baixo faz o app virar cartão;
 * as que ficam com outra por cima recuam (escala e véu `recede`), como no iOS.
 */
let layers: readonly string[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => layers;

export interface SheetLayer {
  /** É a primeira folha aberta: o app atrás vira cartão por causa dela. */
  isBottom: boolean;
  /** Há outra folha aberta por cima desta. */
  hasAbove: boolean;
}

/** Registra a folha `id` enquanto `open` e diz a posição dela entre as abertas. */
export function useSheetLayer(id: string, open: boolean): SheetLayer {
  useLayoutEffect(() => {
    if (!open) return;
    if (!layers.includes(id)) {
      layers = [...layers, id];
      emit();
    }
    return () => {
      layers = layers.filter((layer) => layer !== id);
      emit();
    };
  }, [id, open]);

  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  const index = current.indexOf(id);
  return { isBottom: index === 0, hasAbove: index >= 0 && index < current.length - 1 };
}
