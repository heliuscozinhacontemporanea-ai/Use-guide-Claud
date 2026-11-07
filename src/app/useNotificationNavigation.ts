import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { NotificationLink } from '../domain/notifications';
import type { MenuView } from './menu/menuViews';

const MENU_TARGET: Partial<Record<NotificationLink['screen'], MenuView>> = {
  tickets: 'tickets',
  bookings: 'bookings',
  purchases: 'purchases',
  reviews: 'reviews',
  account: 'username',
  promotions: 'promotions',
};

/**
 * Leva cada aviso para a tela certa (D25): ingressos, reservas e compras abrem no menu; avisos do
 * parceiro (venda, reclamação, plano, avaliação de um item dele) abrem o painel do parceiro.
 */
export function useNotificationNavigation(openMenu: (view: MenuView) => void) {
  const [, setSearchParams] = useSearchParams();

  return useCallback(
    (link: NotificationLink) => {
      const menuView = MENU_TARGET[link.screen];
      if (menuView) {
        openMenu(menuView);
        return;
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('admin');
          next.set('partner', '1');
          return next;
        },
        { replace: false }
      );
    },
    [openMenu, setSearchParams]
  );
}
