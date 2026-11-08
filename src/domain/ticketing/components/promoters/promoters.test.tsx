import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { EventPromotersSummary } from '../../types/promoter';

const m = vi.hoisted(() => ({ get: vi.fn(), invite: vi.fn(), end: vi.fn(), search: vi.fn() }));
vi.mock('../../application/usecases/getEventPromotersUseCase', () => ({
  getEventPromotersUseCase: m.get,
}));
vi.mock('../../application/usecases/invitePromoterUseCase', () => ({
  invitePromoterUseCase: m.invite,
}));
vi.mock('../../application/usecases/endPromoterUseCase', () => ({ endPromoterUseCase: m.end }));
vi.mock('../../../user', () => ({ searchUsernamesUseCase: m.search }));

import { EventPromotersPanel } from './EventPromotersPanel';

const SUMMARY: EventPromotersSummary = {
  tickets: 43,
  soldMinor: 432000,
  owedMinor: 45500,
  rows: [
    {
      id: 'p1',
      eventListingId: 'ev1',
      promoter: { username: 'joao.promo', displayName: 'João' },
      code: 'k7Qm2a',
      earning: { type: 'commission', basisPoints: 1000 },
      status: 'active',
      createdAt: '2026-12-01T12:00:00.000Z',
      tickets: 38,
      soldMinor: 380000,
      owedMinor: 38000,
    },
    {
      id: 'p3',
      eventListingId: 'ev1',
      promoter: { username: 'lucas.kite', displayName: null },
      code: 'Ab3dE5',
      earning: { type: 'flat_fee', amountMinor: 50000 },
      status: 'invited',
      createdAt: '2026-12-02T12:00:00.000Z',
      tickets: 0,
      soldMinor: 0,
      owedMinor: 0,
    },
  ],
};

describe('divulgadores do organizador (p16, p17)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.get.mockResolvedValue(SUMMARY);
  });

  it('mostra vendido, a pagar e a situação de cada divulgador', async () => {
    render(<EventPromotersPanel eventListingId="ev1" />);
    expect(await screen.findByText('@joao.promo')).toBeTruthy();
    expect(screen.getByText(/Comissão de 10% · R\$\s380/)).toBeTruthy();
    expect(screen.getByText('Convite enviado')).toBeTruthy();
    expect(screen.getByText('Ainda sem vendas')).toBeTruthy();
  });

  it('Adicionar: escolhe a pessoa, o valor por ingresso em centavos e envia', async () => {
    m.search.mockResolvedValue([{ username: 'carla.jeri', displayName: 'Carla', photoURL: null }]);
    m.invite.mockResolvedValue(undefined);
    render(<EventPromotersPanel eventListingId="ev1" />);
    await screen.findByText('@joao.promo');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('Usuário do divulgador'), {
      target: { value: 'carla.jeri' },
    });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    vi.useRealTimers();
    await screen.findByText('carla.jeri');
    fireEvent.click(screen.getByLabelText(/Valor por ingresso/));
    const send = screen.getByRole('button', { name: 'Enviar convite' }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '1500' } });
    fireEvent.click(send);
    await waitFor(() =>
      expect(m.invite).toHaveBeenCalledWith('ev1', 'carla.jeri', {
        type: 'per_ticket',
        amountMinor: 1500,
      })
    );
  });

  it('encerrar só depois de confirmar', async () => {
    m.end.mockResolvedValue(undefined);
    render(<EventPromotersPanel eventListingId="ev1" />);
    fireEvent.click(await screen.findByText('@joao.promo'));
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar divulgação' }));
    expect(m.end).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar' }));
    await waitFor(() => expect(m.end).toHaveBeenCalledWith('p1'));
  });
});
