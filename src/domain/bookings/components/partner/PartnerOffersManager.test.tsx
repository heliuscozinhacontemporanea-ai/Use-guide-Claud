import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { PartnerOffersManager } from './PartnerOffersManager';
import { PartnerSlotsManager } from './PartnerSlotsManager';

vi.mock('../../application/usecases/listPartnerOffersUseCase', () => ({
  listPartnerOffersUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/setOfferStatusUseCase', () => ({
  setOfferStatusUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createOfferUseCase', () => ({ createOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/updateOfferUseCase', () => ({ updateOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/listPartnerSlotsUseCase', () => ({
  listPartnerSlotsUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/cancelSlotUseCase', () => ({ cancelSlotUseCase: vi.fn() }));
vi.mock('../../application/usecases/createSlotsUseCase', () => ({ createSlotsUseCase: vi.fn() }));

import { cancelSlotUseCase } from '../../application/usecases/cancelSlotUseCase';
import { createOfferUseCase } from '../../application/usecases/createOfferUseCase';
import { listPartnerOffersUseCase } from '../../application/usecases/listPartnerOffersUseCase';
import { listPartnerSlotsUseCase } from '../../application/usecases/listPartnerSlotsUseCase';

describe('PartnerOffersManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('sem passeio nem atração mostra o estado vazio traduzido', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    await i18n.changeLanguage('fr');
    render(
      <PartnerOffersManager
        canPublish={() => true}
        items={[{ id: 'r1', name: 'Restaurante', category: 'restaurant' }]}
      />
    );
    expect(
      await screen.findByText(
        'Ajoutez une excursion ou une attraction pour vendre des réservations.'
      )
    ).toBeTruthy();
  });

  it('cria oferta convertendo R$ 150,90 em 15090 centavos', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    vi.mocked(createOfferUseCase).mockImplementation(async (payload) => ({
      ...payload,
      id: 'offer_1',
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    }));
    render(
      <PartnerOffersManager
        canPublish={() => true}
        items={[{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }]}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /Nova oferta/ }));
    fireEvent.change(screen.getAllByLabelText('Título')[0]!, {
      target: { value: 'Passeio de buggy' },
    });
    fireEvent.change(screen.getByLabelText('Nome da opção'), { target: { value: 'Adulto' } });
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150,90' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(createOfferUseCase).toHaveBeenCalled());
    const payload = vi.mocked(createOfferUseCase).mock.calls[0]![0];
    expect(payload).toMatchObject({
      guideItemId: 'item-1',
      kind: 'tour',
      title: { 'pt-BR': 'Passeio de buggy' },
    });
    expect(payload.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
  });
});

describe('PartnerSlotsManager', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cancelar horário só acontece depois da confirmação, com o aviso da multa (D14)', async () => {
    vi.mocked(listPartnerSlotsUseCase).mockResolvedValue([
      {
        id: 'slot-1',
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        endsAt: null,
        capacityTotal: 10,
        capacityReserved: 1,
        capacitySold: 3,
        status: 'open',
      },
    ]);
    vi.mocked(cancelSlotUseCase).mockResolvedValue({ canceledBookings: 3 });
    render(<PartnerSlotsManager offerId="offer-1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar horário' }));
    expect(cancelSlotUseCase).not.toHaveBeenCalled();
    expect(await screen.findByText(/multa de 20% do valor vendido/)).toBeTruthy();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar horário' }));
    await waitFor(() => expect(cancelSlotUseCase).toHaveBeenCalledWith('offer-1', 'slot-1'));
    expect(await screen.findByText('Horário cancelado. 3 reservas reembolsadas.')).toBeTruthy();
  });
});
