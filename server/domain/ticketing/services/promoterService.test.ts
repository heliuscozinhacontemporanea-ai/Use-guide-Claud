import { describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn(async (id: string) =>
    id === 'ev1' ? { id: 'ev1', ownerId: 'partner', status: 'published', title: 'Luau' } : null
  ),
}));

import type { PromoterStorePort } from '../ports/promoterStorePort';
import type { TicketingPort } from '../ports/ticketingPort';
import type { EventPromoter } from '../types/promoterTypes';
import { promoterCodeFromParam, promoterOwedMinor } from '../types/promoterTypes';
import { PromoterService } from './promoterService';

const NOW = new Date('2026-12-10T12:00:00.000Z').getTime();
const JOAO = { uid: 'joao', username: 'joao.promo', displayName: 'João' };

function order(
  id: string,
  promoterId: string | undefined,
  status: string,
  subtotal: number,
  discount = 0
) {
  return {
    id,
    eventListingId: 'ev1',
    promoterId,
    status,
    subtotalMinor: subtotal,
    discountMinor: discount,
  };
}

function setup() {
  const promoters = new Map<string, EventPromoter>();
  const store: PromoterStorePort = {
    invite: vi.fn(async (input) => {
      const id = `p${promoters.size + 1}`;
      const promoter = { ...input, id, code: 'k7Qm2a' };
      promoters.set(id, promoter);
      return promoter;
    }),
    get: vi.fn(async (id: string) => promoters.get(id) ?? null),
    transition: vi.fn(async (id, from, patch) => {
      const current = promoters.get(id)!;
      if (!from.includes(current.status))
        throw Object.assign(new Error('x'), { code: 'PROMOTER_WRONG_STATUS' });
      const next = { ...current, ...patch } as EventPromoter;
      promoters.set(id, next);
      return next;
    }),
    listByEvent: vi.fn(async () => [...promoters.values()]),
    listByPromoter: vi.fn(async (uid: string) =>
      [...promoters.values()].filter((promoter) => promoter.promoterUid === uid)
    ),
    findByCode: vi.fn(
      async (_event: string, code: string) =>
        [...promoters.values()].find((promoter) => promoter.code === code) ?? null
    ),
    listByCode: vi.fn(async (code: string) =>
      [...promoters.values()].filter((promoter) => promoter.code === code)
    ),
    anonymizePromoter: vi.fn(async () => 0),
  };
  const port = {
    listOrdersByEventListingId: vi.fn(async () => [
      order('o1', 'p1', 'paid', 20000),
      order('o2', 'p1', 'partially_refunded', 20000, 2000),
      order('o3', 'p1', 'expired', 50000),
      order('o4', undefined, 'paid', 10000),
    ]),
    listTicketsByEventListingId: vi.fn(async () => [
      { orderId: 'o1', status: 'issued' },
      { orderId: 'o1', status: 'checked_in' },
      { orderId: 'o2', status: 'issued' },
      { orderId: 'o2', status: 'refunded' },
      { orderId: 'o4', status: 'issued' },
    ]),
    listRefundsByEventListingId: vi.fn(async () => [
      { orderId: 'o2', status: 'approved', amountMinor: 9300, serviceFeeMinor: 300 },
      { orderId: 'o1', status: 'pending_provider', amountMinor: 10300, serviceFeeMinor: 300 },
    ]),
  } as unknown as TicketingPort;
  return { service: new PromoterService(store, port, () => NOW), promoters };
}

describe('divulgadores (D27)', () => {
  it('link: código fixo depois do último hífen; o @ na frente é só visual', () => {
    expect(promoterCodeFromParam('joao.promo-k7Qm2a')).toBe('k7Qm2a');
    expect(promoterCodeFromParam('k7Qm2a')).toBe('k7Qm2a');
    expect(promoterCodeFromParam('joao.promo')).toBeNull();
    expect(promoterCodeFromParam('a-k7Qm2a0')).toBeNull();
  });

  it('as três formas de ganho', () => {
    const totals = { tickets: 4, soldMinor: 38000, owedMinor: 0 };
    expect(promoterOwedMinor({ type: 'commission', basisPoints: 1000 }, totals)).toBe(3800);
    expect(promoterOwedMinor({ type: 'per_ticket', amountMinor: 1500 }, totals)).toBe(6000);
    expect(promoterOwedMinor({ type: 'flat_fee', amountMinor: 50000 }, totals)).toBe(50000);
  });

  it('convite: só o dono do evento, nunca para si mesmo e com ganho válido', async () => {
    const { service } = setup();
    await expect(
      service.invite({ uid: 'outro' }, 'ev1', JOAO, { type: 'commission', basisPoints: 1000 })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.invite(
        { uid: 'partner' },
        'ev1',
        { ...JOAO, uid: 'partner' },
        {
          type: 'commission',
          basisPoints: 1000,
        }
      )
    ).rejects.toMatchObject({ code: 'PROMOTER_SELF' });
    await expect(
      service.invite({ uid: 'partner' }, 'ev1', JOAO, { type: 'per_ticket', amountMinor: 0 })
    ).rejects.toMatchObject({ code: 'PROMOTER_INVALID_EARNING' });
    await expect(
      service.invite({ uid: 'partner' }, 'ev1', JOAO, { type: 'commission', basisPoints: 1000 })
    ).resolves.toMatchObject({ status: 'invited', code: 'k7Qm2a' });
  });

  it('compra só é atribuída depois do aceite, nunca ao próprio divulgador e não depois de encerrar', async () => {
    const { service } = setup();
    await service.invite({ uid: 'partner' }, 'ev1', JOAO, {
      type: 'commission',
      basisPoints: 1000,
    });
    expect(await service.resolveForOrder('ev1', 'joao.promo-k7Qm2a', 'ana')).toBeNull();
    await expect(service.respond('ana', 'p1', true)).rejects.toMatchObject({
      code: 'PROMOTER_NOT_FOUND',
    });
    await service.respond('joao', 'p1', true);
    expect(await service.resolveForOrder('ev1', 'joao.promo-k7Qm2a', 'ana')).toBe('p1');
    expect(await service.resolveForOrder('ev1', 'joao.promo-k7Qm2a', 'joao')).toBeNull();
    await service.end({ uid: 'partner' }, 'p1');
    expect(await service.resolveForOrder('ev1', 'k7Qm2a', 'ana')).toBeNull();
  });

  it('link curto: só leva ao evento com a divulgação ativa e o evento publicado (C6)', async () => {
    const { service } = setup();
    await service.invite({ uid: 'partner' }, 'ev1', JOAO, {
      type: 'commission',
      basisPoints: 1000,
    });
    expect(await service.eventForLink('joao.promo-k7Qm2a')).toBeNull();
    await service.respond('joao', 'p1', true);
    expect(await service.eventForLink('joao.promo-k7Qm2a')).toBe('ev1');
    // O @ é só visual: trocar de @ não quebra o link já enviado.
    expect(await service.eventForLink('outro.nome-k7Qm2a')).toBe('ev1');
    expect(await service.eventForLink('k7Qm2a')).toBe('ev1');
    expect(await service.eventForLink('joao.promo-AAAAAA')).toBeNull();
    expect(await service.eventForLink('joao.promo')).toBeNull();
    await service.end({ uid: 'partner' }, 'p1');
    expect(await service.eventForLink('joao.promo-k7Qm2a')).toBeNull();
  });

  it('conta: valor pago sem taxa e sem o reembolsado; só ingressos que valem; convite aberto não deve', async () => {
    const { service } = setup();
    await service.invite({ uid: 'partner' }, 'ev1', JOAO, {
      type: 'commission',
      basisPoints: 1000,
    });
    const before = await service.eventSummary({ uid: 'partner' }, 'ev1');
    expect(before.owedMinor).toBe(0);
    await service.respond('joao', 'p1', true);
    const summary = await service.eventSummary({ uid: 'partner' }, 'ev1');
    // o1: 200 pago (reembolso pendente não conta); o2: 180 pago − 90 devolvidos; o3 expirado.
    expect(summary).toMatchObject({ tickets: 3, soldMinor: 29000, owedMinor: 2900 });
    expect((await service.mine('joao'))[0]).toMatchObject({ owedMinor: 2900, code: 'k7Qm2a' });
  });
});
