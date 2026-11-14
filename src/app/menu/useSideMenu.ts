import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { type MenuView, menuParamFor, parseMenuParam } from './menuViews';

type ParamsUpdate = (params: URLSearchParams) => void;

const SUB_PARAM = 'sub';

/** Marca as entradas do histórico criadas ao avançar dentro do menu, para o "voltar" desempilhar. */
interface MenuHistoryState {
  menuStep?: boolean;
}

/**
 * Estado do menu lateral na URL. Cada ação faz uma única troca de parâmetros: o `setSearchParams`
 * do React Router parte da URL do último render, então duas chamadas seguidas perdem a primeira.
 */
export function useSideMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const view = parseMenuParam(searchParams.get('menu'));
  // Página interna da tela do menu (ex.: o detalhe de uma reserva); só um ID, nunca dado pessoal.
  const sub = view ? searchParams.get(SUB_PARAM) : null;
  const isMenuStep = (location.state as MenuHistoryState | null)?.menuStep === true;

  const update = useCallback(
    (change: ParamsUpdate, options: { replace: boolean; state?: MenuHistoryState }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      }, options);
    },
    [setSearchParams]
  );

  /** Abre o menu (ou avança para uma sub-tela) e, opcionalmente, fecha o detalhe de item aberto. */
  const openMenu = useCallback(
    (target: MenuView = 'main', options: { closeItem?: boolean } = {}) => {
      update(
        (params) => {
          params.set('menu', menuParamFor(target));
          params.delete(SUB_PARAM);
          if (options.closeItem) {
            params.delete('item');
            params.delete('type');
          }
        },
        { replace: false, state: view !== null ? { menuStep: true } : undefined }
      );
    },
    [update, view]
  );

  /**
   * Volta para a tela-mãe. Se chegamos aqui avançando no menu, desempilha o histórico (o botão
   * voltar do navegador e o do menu fazem a mesma coisa); se veio de um link direto, troca no lugar.
   */
  const backTo = useCallback(
    (parent: MenuView) => {
      if (isMenuStep) {
        navigate(-1);
        return;
      }
      update(
        (params) => {
          params.set('menu', menuParamFor(parent));
          params.delete(SUB_PARAM);
        },
        { replace: true }
      );
    },
    [isMenuStep, navigate, update]
  );

  /** Abre uma página interna da tela atual, com entrada própria no histórico (DESIGN.md P19). */
  const openSub = useCallback(
    (id: string) => {
      update((params) => params.set(SUB_PARAM, id), { replace: false, state: { menuStep: true } });
    },
    [update]
  );

  /** Fecha a página interna: desempilha o histórico, ou troca no lugar se veio de um link direto. */
  const closeSub = useCallback(() => {
    if (isMenuStep) {
      navigate(-1);
      return;
    }
    update((params) => params.delete(SUB_PARAM), { replace: true });
  }, [isMenuStep, navigate, update]);

  const closeMenu = useCallback(() => {
    update(
      (params) => {
        params.delete('menu');
        params.delete(SUB_PARAM);
      },
      { replace: false }
    );
  }, [update]);

  /** Fecha o menu e abre o detalhe do item na mesma navegação. */
  const closeMenuAndOpenItem = useCallback(
    (item: { id: string; category: string }) => {
      update(
        (params) => {
          params.delete('menu');
          params.delete(SUB_PARAM);
          params.set('item', item.id);
          params.set('type', item.category === 'event' ? 'event' : 'item');
        },
        { replace: false }
      );
    },
    [update]
  );

  return {
    view,
    sub,
    isOpen: view !== null,
    openMenu,
    backTo,
    openSub,
    closeSub,
    closeMenu,
    closeMenuAndOpenItem,
  };
}
