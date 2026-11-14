import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { MyPromotion } from '../../types/promoter';
import { readPromoterLink, rememberPromoterLink } from '../../utils/promoterLinkStorage';

const m = vi.hoisted(() => ({ list: vi.fn(), respond: vi.fn() }));
vi.mock('../../application/usecases/listMyPromotionsUseCase', () => ({
  listMyPromotionsUseCase: m.list,
}));
vi.mock('../../application/usecases/respondPromoterInviteUseCase', () => ({
  respondPromoterInviteUseCase: m.respond,
}));

import { MyPromotionsView } from './MyPromotionsView';

const base: Omit<MyPromotion, 'id' | 'status' | 'earning' | 'eventTitle'> = {
  eventListingId: 'ev1',
  code: 'k7Qm2a',
  createdAt: '2026-12-01T12:00:00.000Z',
  tickets: 38,
  soldMinor: 380000,
  owedMinor: 38000,
  username: 'joao',
  businessName: 'Buggy do Preá',
  startsAt: '2026-12-20T23:00:00.000Z',
};

describe('Divulgação do usuário (p26, p27)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    localStorage.clear();
    m.respond.mockResolvedValue(undefined);
    m.list.mockResolvedValue([
      {
        ...base,
        id: 'p1',
        status: 'active',
        earning: { type: 'commission', basisPoints: 1000 },
        eventTitle: 'Luau na Duna',
      },
      {
        ...base,
        id: 'p2',
        eventListingId: 'ev2',
        status: 'invited',
        earning: { type: 'per_ticket', amountMinor: 1500 },
        eventTitle: 'Festival de Forró',
        tickets: 0,
        soldMinor: 0,
        owedMinor: 0,
      },
    ]);
  });

  it('soma só o que já foi aceito e mostra o link com o @ e o código', async () => {
    render(<MyPromotionsView />);
    expect(await screen.findByText('Luau na Duna')).toBeTruthy();
    expect(screen.getByText('38 ingressos vendidos pelos seus links')).toBeTruthy();
    expect(screen.getByText(/\/e\/joao-k7Qm2a$/)).toBeTruthy();
    expect(screen.getByText(/Convite para divulgar · R\$\s15/)).toBeTruthy();
  });

  it('aceitar passa pela folha com quanto ganha e quem paga', async () => {
    render(<MyPromotionsView />);
    fireEvent.click(await screen.findByRole('button', { name: 'Aceitar' }));
    expect(screen.getByText('Buggy do Preá, direto a você')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar e pegar meu link' }));
    await waitFor(() => expect(m.respond).toHaveBeenCalledWith('p2', true));
  });

  it('o link fica guardado por 7 dias e ignora valor fora do formato', () => {
    const now = Date.UTC(2026, 11, 1);
    rememberPromoterLink('joao.promo-k7Qm2a', now);
    expect(readPromoterLink(now + 6 * 86_400_000)).toBe('joao.promo-k7Qm2a');
    expect(readPromoterLink(now + 8 * 86_400_000)).toBeNull();
    rememberPromoterLink('<script>', now);
    expect(readPromoterLink(now)).toBe('joao.promo-k7Qm2a');
  });
});
