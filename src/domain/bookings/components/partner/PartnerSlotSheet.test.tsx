import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ detail: vi.fn() }));
vi.mock('../../application/usecases/getPartnerSlotDetailUseCase', () => ({
  getPartnerSlotDetailUseCase: m.detail,
}));

import { PartnerSlotSheet } from './PartnerSlotSheet';

describe('folha do horário (p06)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra os números, o nome público de cada cliente e quem já chegou', async () => {
    m.detail.mockResolvedValue({
      slot: {
        id: 's1',
        startsAt: '2026-11-04T12:00:00.000Z',
        endsAt: null,
        capacityTotal: 8,
        capacityReserved: 0,
        capacitySold: 6,
        status: 'open',
      },
      offer: {
        id: 'o1',
        title: 'Passeio de buggy ao Preá',
        kind: 'tour',
        meetingPoint: 'Praça Principal',
      },
      bookings: [
        { id: 'b1', buyerName: 'Ana Souza', units: 2, checkedInUnits: 2 },
        { id: 'b2', buyerName: null, units: 2, checkedInUnits: 0 },
      ],
    });
    render(<PartnerSlotSheet offerId="o1" slotId="s1" onClose={vi.fn()} onChanged={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Ana Souza · 2 pessoas')).toBeInTheDocument());
    expect(screen.getByText('Cliente · 2 pessoas')).toBeInTheDocument();
    expect(screen.getByText('Chegou')).toBeInTheDocument();
    expect(screen.getByText('Aguardando')).toBeInTheDocument();
    expect(screen.getByText('4 de 8')).toBeInTheDocument();
    expect(screen.getByText(/ponto de encontro: Praça Principal/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar chegada com código' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar horário' })).toBeInTheDocument();
  });
});
