import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import type { StackAction } from './stackTypes';

/** Tela da pilha em que o componente está (a chave da entrada). */
export const StackPageKeyContext = createContext<string | null>(null);

/** Ações da barra fixa registradas pelas próprias telas, por chave da entrada. */
export const StackActionsContext = createContext<
  ((key: string, action: StackAction | null) => void) | null
>(null);

/**
 * Põe a ação da tela no lado direito da barra fixa da folha (DESIGN.md §8: no máximo uma).
 * Devolve `true` dentro da folha em pilha; fora dela a tela desenha o próprio botão.
 */
export function useStackPageAction(action: StackAction | null): boolean {
  const key = useContext(StackPageKeyContext);
  const setAction = useContext(StackActionsContext);
  const onClick = useRef(action?.onClick);
  onClick.current = action?.onClick;
  const label = action?.label;
  const icon = action?.icon;
  const busy = action?.busy;

  useLayoutEffect(() => {
    if (!key || !setAction) return;
    setAction(
      key,
      label && icon ? { label, icon, busy, onClick: () => onClick.current?.() } : null
    );
    return () => setAction(key, null);
  }, [key, setAction, label, icon, busy]);

  return Boolean(key && setAction);
}
