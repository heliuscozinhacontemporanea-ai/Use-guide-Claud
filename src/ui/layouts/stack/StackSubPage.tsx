import {
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Página interna de uma tela da folha em pilha (ex.: o detalhe de uma reserva): entra na pilha como
 * mais uma tela, com a barra fixa, a mola e os gestos (DESIGN.md §9, D33). O estado continua na tela
 * que a abriu; o conteúdo é desenhado na página da pilha por portal.
 */
export interface StackSubPageHost {
  /** Página interna aberta (fica na URL, para o voltar do sistema e o recarregar). */
  id: string | null;
  /** Mantém a página desenhada enquanto ela sai deslizando. */
  renderedId: string | null;
  open: (id: string) => void;
  close: () => void;
  title: string | undefined;
  setTitle: (title: string | undefined) => void;
  slot: HTMLElement | null;
  setSlot: (node: HTMLElement | null) => void;
}

const StackSubPageContext = createContext<StackSubPageHost | null>(null);

export const StackSubPageProvider = StackSubPageContext.Provider;

/** Estado do lugar da página interna, mantido por quem monta a folha. */
export function useStackSubPageHost(options: {
  id: string | null;
  renderedId: string | null;
  open: (id: string) => void;
  close: () => void;
}): StackSubPageHost {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const { id, renderedId, open, close } = options;
  return useMemo(
    () => ({ id, renderedId, open, close, title, setTitle, slot, setSlot }),
    [id, renderedId, open, close, title, slot]
  );
}

export interface StackSubPageControl {
  /** Está dentro da folha em pilha; fora dela (ex.: painel do parceiro) a tela troca no lugar. */
  inStack: boolean;
  /** Página interna a desenhar (inclui a que está saindo). */
  id: string | null;
  open: (id: string) => void;
  close: () => void;
}

/** Abre e fecha a página interna; fora da folha, guarda o estado na própria tela. */
export function useStackSubPage(initialId: string | null = null): StackSubPageControl {
  const host = useContext(StackSubPageContext);
  const [localId, setLocalId] = useState<string | null>(initialId);
  if (host) {
    return { inStack: true, id: host.renderedId, open: host.open, close: host.close };
  }
  return { inStack: false, id: localId, open: setLocalId, close: () => setLocalId(null) };
}

/** Desenha `children` na página interna da pilha, com `title` na barra fixa. */
export function StackSubPage({ title, children }: { title: string; children: ReactNode }) {
  const host = useContext(StackSubPageContext);
  const setTitle = host?.setTitle;
  useLayoutEffect(() => {
    if (!setTitle) return;
    setTitle(title);
    return () => setTitle(undefined);
  }, [setTitle, title]);
  if (!host?.slot) return null;
  return createPortal(children, host.slot);
}

/** Lugar da página interna dentro da pilha (a `render` da tela da pilha). */
export function StackSubPageSlot({ fallback }: { fallback: ReactNode }) {
  const host = useContext(StackSubPageContext);
  return (
    <>
      {host?.title === undefined && fallback}
      <div ref={host?.setSlot} className="flex-1 flex flex-col" />
    </>
  );
}
