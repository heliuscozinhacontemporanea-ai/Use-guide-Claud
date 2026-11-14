import { createContext, useContext, useEffect, useRef } from 'react';
import type { StackAction } from './stackTypes';

/** Cada página da pilha recebe o seu: a ação que ela declara vai para a barra fixa. */
export const StackPageActionContext = createContext<((action: StackAction | null) => void) | null>(
  null
);

/**
 * A página declara a ação em ícone à direita da barra fixa (DESIGN.md §8), quando ela depende do que
 * a página carregou ou mostra (ex.: "Editar" some na aba Convidados do evento). Devolve se está numa
 * pilha: fora dela, a página mostra a ação no próprio conteúdo.
 */
export function useStackPageAction(action: StackAction | null): boolean {
  const setAction = useContext(StackPageActionContext);
  const onClick = useRef(action?.onClick);
  onClick.current = action?.onClick;
  const label = action?.label;
  const icon = action?.icon;

  useEffect(() => {
    if (!setAction) return;
    setAction(label && icon ? { label, icon, onClick: () => onClick.current?.() } : null);
    return () => setAction(null);
  }, [setAction, label, icon]);

  return setAction !== null;
}
