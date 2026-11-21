import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { PartnerOfferPage } from './PartnerOfferPage';

vi.mock('../../application/usecases/listPartnerOffersUseCase', () => ({
  listPartnerOffersUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createOfferUseCase', () => ({ createOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/updateOfferUseCase', () => ({ updateOfferUseCase: vi.fn() }));
vi.mock('../../application/usecases/setOfferStatusUseCase', () => ({
  setOfferStatusUseCase: vi.fn(),
}));

import { createOfferUseCase } from '../../application/usecases/createOfferUseCase';
import { listPartnerOffersUseCase } from '../../application/usecases/listPartnerOffersUseCase';
import { updateOfferUseCase } from '../../application/usecases/updateOfferUseCase';

const offer = {
  id: 'o1',
  guideItemId: 'item-1',
  kind: 'tour',
  status: 'draft',
  title: { 'pt-BR': 'Passeio de buggy', en: 'Buggy ride', fr: 'Balade en buggy' },
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 18000 }],
  },
  durationMinutes: 270,
  cancellationPolicy: 'flexible',
  maxParticipantsPerBooking: 8,
  requiresParticipantNames: false,
  createdAt: '',
  updatedAt: '',
} as unknown as PartnerOffer;

function renderEditor(page: Parameters<typeof PartnerOfferPage>[0]['page']) {
  let save: (() => void) | null = null;
  const onSaved = vi.fn();
  render(
    <PartnerOfferPage
      page={page}
      registerSave={(next) => {
        save = next;
      }}
      onSaved={onSaved}
    />
  );
  return {
    onSaved,
    save: () =>
      act(() => {
        (save as unknown as () => void)();
      }),
  };
}

describe('PartnerOfferPage · editor (F3)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([offer]);
  });

  it('nova oferta: um texto só, sem abas de idioma; salva pela barra em centavos e minutos', async () => {
    vi.mocked(createOfferUseCase).mockImplementation(async (payload) => ({
      ...offer,
      ...payload,
      id: 'o2',
    }));
    const { save, onSaved } = renderEditor({ kind: 'editor', itemId: 'item-1', category: 'tour' });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Lagoa do Paraíso' } });
    fireEvent.change(screen.getByLabelText('Nome da opção'), { target: { value: 'Adulto' } });
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150,90' } });
    fireEvent.change(screen.getByLabelText('Horas'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Minutos'), { target: { value: '30' } });
    save();
    await waitFor(() => expect(createOfferUseCase).toHaveBeenCalled());
    const payload = vi.mocked(createOfferUseCase).mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      guideItemId: 'item-1',
      kind: 'tour',
      title: { 'pt-BR': 'Lagoa do Paraíso' },
      durationMinutes: 90,
    });
    expect(payload?.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
    expect(onSaved).toHaveBeenCalledWith({
      offerId: 'o2',
      title: 'Lagoa do Paraíso',
      created: true,
    });
  });

  it('duração fora de 15 min a 24 h não salva e diz o limite', async () => {
    const { save } = renderEditor({ kind: 'editor', itemId: 'item-1', category: 'tour' });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Lagoa' } });
    fireEvent.change(screen.getByLabelText('Nome da opção'), { target: { value: 'Adulto' } });
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Horas'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Minutos'), { target: { value: '10' } });
    save();
    expect(await screen.findByText('A duração vai de 15 min a 24 h.')).toBeTruthy();
    expect(createOfferUseCase).not.toHaveBeenCalled();
  });

  it('editar: mostra horas e minutos e grava só o texto escrito (as traduções à mão saem)', async () => {
    vi.mocked(updateOfferUseCase).mockImplementation(async () => offer);
    const { save, onSaved } = renderEditor({
      kind: 'editor',
      itemId: 'item-1',
      category: 'tour',
      offerId: 'o1',
    });
    expect(await screen.findByDisplayValue('Passeio de buggy')).toBeTruthy();
    expect((screen.getByLabelText('Horas') as HTMLInputElement).value).toBe('4');
    expect((screen.getByLabelText('Minutos') as HTMLInputElement).value).toBe('30');
    save();
    await waitFor(() => expect(updateOfferUseCase).toHaveBeenCalled());
    const fields = vi.mocked(updateOfferUseCase).mock.calls[0]?.[1];
    expect(fields?.title).toEqual({ 'pt-BR': 'Passeio de buggy' });
    expect(fields?.durationMinutes).toBe(270);
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ created: false }));
  });

  it('oferta que não existe mais: avisa em vez de abrir o editor vazio', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    renderEditor({ kind: 'slots', offerId: 'sumiu' });
    expect(await screen.findByText('Esta oferta não está mais disponível.')).toBeTruthy();
  });
});

describe('PartnerOfferPage · aluguel e translado (F3b)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    vi.mocked(createOfferUseCase).mockImplementation(async (payload) => ({
      ...offer,
      ...payload,
      id: 'o9',
    }));
  });

  it('aluguel: veículo do anúncio, período em centavos e horário personalizado por hora', async () => {
    const { save } = renderEditor({
      kind: 'editor',
      itemId: 'item-1',
      category: 'rental',
      listing: { vehicles: ['Quadriciclo', 'Bicicleta'] },
    });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Quadriciclo' } });
    fireEvent.change(screen.getByLabelText('Preço por veículo (R$)'), { target: { value: '300' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Horário personalizado' }));
    fireEvent.change(screen.getByLabelText('Valor por hora (R$)'), { target: { value: '80' } });
    save();
    await waitFor(() => expect(createOfferUseCase).toHaveBeenCalled());
    expect(vi.mocked(createOfferUseCase).mock.calls[0]?.[0]).toMatchObject({
      kind: 'rental',
      vehicle: 'Quadriciclo',
      sellingUnit: 'group',
      groupMaxPeople: 2,
      fleet: { fixed: [{ start: '08:00', minutes: 240 }], custom: { mode: 'hours', minHours: 2 } },
      pricing: {
        priceOptions: [
          expect.objectContaining({ unitAmountMinor: 30000 }),
          expect.objectContaining({ id: 'hourly', unitAmountMinor: 8000 }),
        ],
      },
    });
  });

  it('translado privativo: trecho num sentido, preço por veículo e horário escolhido', async () => {
    const { save } = renderEditor({
      kind: 'editor',
      itemId: 'item-1',
      category: 'transfer',
      listing: { routes: [{ from: 'Jericoacoara', to: 'Aeroporto de Jeri' }] },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Aeroporto de Jeri → Jericoacoara' }));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Do aeroporto' } });
    fireEvent.change(screen.getByLabelText('Preço por veículo (R$)'), { target: { value: '250' } });
    save();
    await waitFor(() => expect(createOfferUseCase).toHaveBeenCalled());
    expect(vi.mocked(createOfferUseCase).mock.calls[0]?.[0]).toMatchObject({
      kind: 'transfer',
      route: { from: 'Aeroporto de Jeri', to: 'Jericoacoara' },
      sellingUnit: 'group',
      durationMinutes: 60,
      cancellationPolicy: 'transfer_flexible',
      fleet: {
        fixed: [],
        custom: { mode: 'time', from: '06:00', to: '22:00', minNoticeHours: 12 },
      },
      pricing: {
        priceOptions: [expect.objectContaining({ id: 'vehicle', unitAmountMinor: 25000 })],
      },
    });
  });

  it('aluguel sem período nem horário personalizado não salva e diz o que falta', async () => {
    const { save } = renderEditor({
      kind: 'editor',
      itemId: 'item-1',
      category: 'rental',
      listing: { vehicles: ['Quadriciclo'] },
    });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Quadriciclo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remover período' }));
    save();
    expect(
      await screen.findByText('Informe um período ou ative o horário personalizado.')
    ).toBeTruthy();
    expect(createOfferUseCase).not.toHaveBeenCalled();
  });
});
