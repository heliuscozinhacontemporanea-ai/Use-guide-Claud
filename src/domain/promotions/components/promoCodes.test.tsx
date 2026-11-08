import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import type { PartnerPromoCode, PromoCodesData } from '../types/promoCode';

const m = vi.hoisted(() => ({ list: vi.fn(), save: vi.fn(), limits: vi.fn(), remove: vi.fn() }));
vi.mock('../application/usecases/listPromoCodesUseCase', () => ({ listPromoCodesUseCase: m.list }));
vi.mock('../application/usecases/savePromoCodeUseCase', () => ({ savePromoCodeUseCase: m.save }));
vi.mock('../application/usecases/updatePromoCodeLimitsUseCase', () => ({
  updatePromoCodeLimitsUseCase: m.limits,
}));
vi.mock('../application/usecases/deletePromoCodeUseCase', () => ({
  deletePromoCodeUseCase: m.remove,
}));

import { PromoCodesPage } from './PromoCodesPage';

function promo(overrides: Partial<PartnerPromoCode>): PartnerPromoCode {
  return {
    id: 'pc1',
    code: 'VERAO10',
    type: 'percentage',
    percentage: 10,
    valueMinor: null,
    targets: [
      { kind: 'event', id: 'ev1', optionIds: null, title: 'Luau na Duna', optionNames: [] },
    ],
    maxUses: 100,
    usedCount: 3,
    onePerAccount: true,
    maxTicketsPerOrder: null,
    startsAt: null,
    endsAt: null,
    status: 'active',
    locked: true,
    createdAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

const DATA: PromoCodesData = {
  promoCodes: [
    promo({}),
    promo({
      id: 'pc2',
      code: 'FORRO20',
      type: 'fixed',
      percentage: null,
      valueMinor: 2000,
      targets: [
        { kind: 'event', id: 'ev2', optionIds: null, title: 'Festival de Forró', optionNames: [] },
      ],
      maxUses: null,
      usedCount: 0,
      status: 'paused',
      locked: false,
    }),
  ],
  targets: [
    {
      kind: 'event',
      id: 'ev1',
      title: 'Luau na Duna',
      status: 'published',
      offerKind: null,
      options: [{ id: 'vip', name: 'VIP', sessionStartsAt: '2026-12-20T23:00:00.000Z' }],
    },
    {
      kind: 'event',
      id: 'ev2',
      title: 'Festival de Forró',
      status: 'published',
      offerKind: null,
      options: [],
    },
    {
      kind: 'offer',
      id: 'of1',
      title: 'Buggy ao Preá',
      status: 'published',
      offerKind: 'tour',
      options: [
        { id: 'adulto', name: 'Adulto', sessionStartsAt: null },
        { id: 'crianca', name: 'Criança', sessionStartsAt: null },
      ],
    },
  ],
};

describe('Área Cupons (B1)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.list.mockResolvedValue(DATA);
    m.save.mockResolvedValue({});
    m.limits.mockResolvedValue(undefined);
    m.remove.mockResolvedValue(undefined);
  });

  it('lista os cupons com desconto, anúncios, usos e situação; aberta pelo evento, só os dele', async () => {
    const { unmount } = render(<PromoCodesPage backLabel="Mais" onBack={vi.fn()} />);
    expect(await screen.findByRole('button', { name: /VERAO10 · 10% de desconto/ })).toBeTruthy();
    expect(screen.getByText('Luau na Duna · 3 de 100 usos')).toBeTruthy();
    expect(screen.getByRole('button', { name: /FORRO20 · R\$\s20,00 por compra/ })).toBeTruthy();
    expect(screen.getByText('Pausado')).toBeTruthy();
    unmount();

    render(
      <PromoCodesPage scope={{ kind: 'event', id: 'ev2' }} backLabel="Catálogo" onBack={vi.fn()} />
    );
    expect(await screen.findByText('Cupons que valem para Festival de Forró.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /VERAO10/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos os cupons' }));
    expect(screen.getByRole('button', { name: /VERAO10/ })).toBeTruthy();
  });

  it('cria cupom já com o evento de onde veio', async () => {
    render(
      <PromoCodesPage scope={{ kind: 'event', id: 'ev1' }} backLabel="Catálogo" onBack={vi.fn()} />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Criar' }));
    const sheet = await screen.findByRole('dialog');
    fireEvent.change(within(sheet).getByLabelText('Código'), { target: { value: 'luau 15!' } });
    fireEvent.change(within(sheet).getByLabelText('Porcentagem de desconto'), {
      target: { value: '15' },
    });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Criar cupom' }));
    await waitFor(() =>
      expect(m.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'LUAU15',
          percentage: 15,
          targets: [{ kind: 'event', id: 'ev1', optionIds: null }],
          onePerAccount: true,
          maxUses: null,
        }),
        undefined
      )
    );
  });

  it('vale para oferta com só algumas opções de preço', async () => {
    render(<PromoCodesPage backLabel="Mais" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Criar' }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('Passeios, aluguéis, translados e entradas')).toBeTruthy();
    fireEvent.change(within(sheet).getByLabelText('Código'), { target: { value: 'BUGGY' } });
    fireEvent.click(within(sheet).getByRole('checkbox', { name: 'Buggy ao Preá' }));
    fireEvent.click(within(sheet).getByRole('radio', { name: 'Escolher opções de preço' }));
    fireEvent.click(within(sheet).getByRole('checkbox', { name: 'Adulto' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Criar cupom' }));
    await waitFor(() =>
      expect(m.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'BUGGY',
          targets: [{ kind: 'offer', id: 'of1', optionIds: ['adulto'] }],
        }),
        undefined
      )
    );
  });

  it('cupom já usado: desconto travado, muda só limite e fim; não pode ser excluído', async () => {
    render(<PromoCodesPage backLabel="Mais" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: /VERAO10/ }));
    let sheet = await screen.findByRole('dialog');
    expect(within(sheet).queryByRole('button', { name: 'Excluir cupom' })).toBeNull();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Mudar limite ou fim' }));
    sheet = await screen.findByRole('dialog');
    expect((within(sheet).getByLabelText('Código') as HTMLInputElement).disabled).toBe(true);
    fireEvent.change(within(sheet).getByLabelText('Número de usos'), { target: { value: '200' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(m.limits).toHaveBeenCalledWith('pc1', { maxUses: 200, endsAt: null })
    );
    expect(m.save).not.toHaveBeenCalled();
  });

  it('reativa cupom pausado e exclui cupom sem uso depois de confirmar', async () => {
    render(<PromoCodesPage backLabel="Mais" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: /FORRO20/ }));
    let sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Reativar' }));
    await waitFor(() => expect(m.limits).toHaveBeenCalledWith('pc2', { isActive: true }));

    fireEvent.click(await screen.findByRole('button', { name: /FORRO20/ }));
    sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Excluir cupom' }));
    expect(await screen.findByText('Excluir FORRO20?')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'Excluir cupom' });
    fireEvent.click(buttons[buttons.length - 1]!);
    await waitFor(() => expect(m.remove).toHaveBeenCalledWith('pc2'));
  });
});
