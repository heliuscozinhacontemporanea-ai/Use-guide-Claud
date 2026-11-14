import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { UserTicketsHistoryView } from './UserTicketsHistoryView';

const wallet = {
  tickets: [],
  orders: [],
  loading: false,
  error: null as string | null,
  reload: vi.fn(async () => undefined),
};

vi.mock('../hooks/useUserTickets', () => ({ useUserTicketsAndOrders: () => wallet }));
vi.mock('../hooks/useTicketWalletActions', () => ({
  useTicketWalletActions: () => ({ feedback: null, transferTicket: null, busy: false }),
}));

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('UserTicketsHistoryView', () => {
  beforeEach(() => {
    wallet.reload.mockClear();
    wallet.error = null;
  });

  it('sem botão de atualizar: recarrega quando a pessoa volta ao app', () => {
    render(<UserTicketsHistoryView />);
    expect(screen.queryByRole('button', { name: /atualizar/i })).toBeNull();
    act(() => setVisibility('hidden'));
    expect(wallet.reload).not.toHaveBeenCalled();
    act(() => setVisibility('visible'));
    expect(wallet.reload).toHaveBeenCalledTimes(1);
  });

  it('erro de carregamento mostra o texto traduzido, nunca a mensagem crua do servidor', () => {
    wallet.error = 'Firestore: permission-denied (internal)';
    render(<UserTicketsHistoryView />);
    expect(screen.getByText(i18n.t('ticketWallet.loadError'))).toBeTruthy();
    expect(screen.queryByText(/permission-denied/)).toBeNull();
  });
});
