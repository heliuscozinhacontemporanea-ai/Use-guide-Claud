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
        onOpenPage={vi.fn()}
      />
    );
    expect(
      await screen.findByText(
        'Ajoutez une excursion ou une attraction pour vendre des réservations.'
      )
    ).toBeTruthy();
  });

  it('um estabelecimento só: "Criar" abre a página do editor já ligada a ele (F3)', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    const onCreatingChange = vi.fn();
    const onOpenPage = vi.fn();
    render(
      <PartnerOffersManager
        canPublish={() => true}
        items={[{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }]}
        creating
        onCreatingChange={onCreatingChange}
        onOpenPage={onOpenPage}
      />
    );
    await waitFor(() =>
      expect(onOpenPage).toHaveBeenCalledWith({
        kind: 'editor',
        itemId: 'item-1',
        category: 'tour',
        listing: { vehicles: undefined, routes: undefined },
        title: 'Nova oferta',
      })
    );
    expect(onCreatingChange).toHaveBeenCalledWith(false);
  });

  it('a lista relê as ofertas quando uma página de oferta fecha (versão nova)', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    const props = {
      canPublish: () => true,
      items: [{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }],
      onOpenPage: vi.fn(),
    };
    const { rerender } = render(<PartnerOffersManager {...props} version={0} />);
    await waitFor(() => expect(listPartnerOffersUseCase).toHaveBeenCalledTimes(1));
    rerender(<PartnerOffersManager {...props} version={1} />);
    await waitFor(() => expect(listPartnerOffersUseCase).toHaveBeenCalledTimes(2));
  });

  it('linha da oferta abre a folha; sem conta pronta, "Publicar" fica desabilitado e explica', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([
      {
        id: 'o1',
        guideItemId: 'item-1',
        kind: 'tour',
        status: 'draft',
        title: { 'pt-BR': 'Passeio de buggy' },
        pricing: {
          currency: 'BRL',
          priceOptions: [{ id: 'a', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 18000 }],
        },
        createdAt: '',
        updatedAt: '',
      } as never,
    ]);
    const onOpenPage = vi.fn();
    render(
      <PartnerOffersManager
        canPublish={() => false}
        items={[{ id: 'item-1', name: 'Buggy do Preá', category: 'tour' }]}
        onOpenPage={onOpenPage}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /Passeio de buggy/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/R\$\s180 por pessoa · Rascunho/)).toBeTruthy();
    const publish = within(dialog).getByRole('button', { name: 'Publicar' });
    expect((publish as HTMLButtonElement).disabled).toBe(true);
    expect(
      within(dialog).getByText(
        'Conclua a configuração financeira do CNPJ deste estabelecimento para publicar.'
      )
    ).toBeTruthy();
    // Horários e editar abrem páginas do painel (F3).
    // A página abre depois que a folha sai do histórico (o voltar dela é assíncrono).
    fireEvent.click(within(dialog).getByRole('button', { name: /Horários/ }));
    await waitFor(() =>
      expect(onOpenPage).toHaveBeenCalledWith({ kind: 'slots', offerId: 'o1', title: 'Horários' })
    );
  });

  it('com mais de um estabelecimento, "Criar" pergunta em qual', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    const onOpenPage = vi.fn();
    render(
      <PartnerOffersManager
        canPublish={() => true}
        creating
        onCreatingChange={vi.fn()}
        onOpenPage={onOpenPage}
        items={[
          { id: 'a', name: 'Buggy do Preá', category: 'tour' },
          { id: 'b', name: 'Dunas Park', category: 'sight' },
        ]}
      />
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Em qual estabelecimento?')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: /Dunas Park/ }));
    await waitFor(() =>
      expect(onOpenPage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'editor', itemId: 'b', category: 'sight' })
      )
    );
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
