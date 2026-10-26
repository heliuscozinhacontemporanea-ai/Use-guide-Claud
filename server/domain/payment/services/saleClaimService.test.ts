import { describe, expect, it, vi } from 'vitest';
import { InMemoryPayoutEntryAdapter } from '../adapters/inMemoryPayoutEntryAdapter';
import { InMemorySaleClaimAdapter } from '../adapters/inMemorySaleClaimAdapter';
import { PayoutService } from './payoutService';
import { type OpenSaleClaimInput, SaleClaimService } from './saleClaimService';

const ENTRY_ID = 'po_ticket_order_ord_1';

const CLAIM: OpenSaleClaimInput = {
  referenceType: 'ticket_order',
  referenceId: 'ord_1',
  buyerUid: 'buyer-1',
  reason: 'did_not_happen',
  details: 'O local estava fechado.',
  serviceStartsAt: '2026-12-20T22:00:00.000Z',
  serviceEndsAt: '2026-12-21T03:00:00.000Z',
};

async function setup(now = '2026-12-21T10:00:00.000Z', refundStatus = 'succeeded') {
  const entries = new InMemoryPayoutEntryAdapter();
  const clock = { value: new Date(now) };
  const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
  const debts = { offsetFromPayout: vi.fn().mockResolvedValue(0), createDebt: vi.fn() };
  const payouts = new PayoutService(
    entries,
    transfers,
    { getPayoutDestination: vi.fn().mockResolvedValue('acct_1') },
    debts,
    () => clock.value
  );
  await payouts.recordSale({
    referenceType: 'ticket_order',
    referenceId: 'ord_1',
    accountKey: 'key-1',
    paymentIntentId: 'pi_1',
    chargeId: 'ch_1',
    grossMinor: 10600,
    serviceFeeMinor: 600,
    platformFeeMinor: 1000,
    serviceEndsAt: CLAIM.serviceEndsAt,
  });
  const gateway = {
    refundPayment: vi.fn().mockResolvedValue({ providerRefundId: 're_1', status: refundStatus }),
  };
  const claims = new InMemorySaleClaimAdapter();
  const service = new SaleClaimService(claims, payouts, gateway, () => clock.value);
  return { entries, clock, transfers, gateway, claims, service, payouts };
}

describe('SaleClaimService (D16 2A)', () => {
  it('só do início do serviço até 48 h depois do fim', async () => {
    const early = await setup('2026-12-20T21:00:00.000Z');
    await expect(early.service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_TOO_EARLY' });
    const late = await setup('2026-12-23T03:00:01.000Z');
    await expect(late.service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_WINDOW_CLOSED' });
  });

  it('abre uma por venda, retém o repasse e decide em até 5 dias', async () => {
    const { service, entries } = await setup();
    const claim = await service.open(CLAIM);
    expect(claim).toMatchObject({ status: 'open', decideBy: '2026-12-26T10:00:00.000Z' });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({ status: 'on_hold', holdReasons: ['claim'] });
    await expect(service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_ALREADY_EXISTS' });
  });

  it('o comprador não vê o próprio texto na lista; o admin vê, com o valor reembolsável', async () => {
    const { service } = await setup();
    await service.open(CLAIM);
    const [mine] = await service.listForBuyer('buyer-1');
    expect(mine).not.toHaveProperty('details');
    expect(await service.listForBuyer('buyer-2')).toEqual([]);
    const { data, nextCursor } = await service.listPendingForAdmin(10);
    // O parcial não devolve a taxa de serviço; ela só volta no reembolso integral.
    expect(data[0]).toMatchObject({
      details: 'O local estava fechado.',
      refundableMinor: 10600,
      maxPartialRefundMinor: 10000,
      accountKey: expect.any(String),
    });
    expect(nextCursor).toBeNull();
  });

  it('liberar devolve a venda à fila do repasse', async () => {
    const { service, entries, clock, payouts, transfers } = await setup();
    const claim = await service.open(CLAIM);
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    expect((await payouts.releaseDue()).released).toBe(0);
    await service.decide(claim.id, 'admin-1', { outcome: 'release' });
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
    expect((await payouts.releaseDue()).released).toBe(1);
    expect(transfers.createTransfer).toHaveBeenCalledTimes(1);
    await expect(service.decide(claim.id, 'admin-1', { outcome: 'release' })).rejects.toMatchObject(
      {
        code: 'CLAIM_ALREADY_DECIDED',
      }
    );
  });

  it('reembolso integral devolve tudo, com a taxa de serviço, e cancela o repasse', async () => {
    const { service, entries, gateway } = await setup();
    const claim = await service.open(CLAIM);
    const decided = await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(gateway.refundPayment).toHaveBeenCalledWith({
      paymentIntentId: 'pi_1',
      amountMinor: 10600,
      idempotencyKey: `refund_claim_${claim.id}_1`,
      metadata: { referenceType: 'claim_refund', claimId: claim.id },
    });
    expect(decided).toMatchObject({ status: 'refunded', refundServiceFeeMinor: 600 });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'canceled',
      canceledReason: 'fully_refunded',
    });
    await service.completeRefund(claim.id, 're_1');
    expect(Object.keys(entries.rows.get(ENTRY_ID)?.refunds ?? {})).toEqual(['re_1']);
  });

  it('reembolso parcial sai só do valor do proprietário', async () => {
    const { service, entries } = await setup();
    const claim = await service.open(CLAIM);
    await expect(
      service.decide(claim.id, 'admin-1', { outcome: 'refund_partial', amountMinor: 10001 })
    ).rejects.toMatchObject({ code: 'INVALID_REFUND_AMOUNT' });
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_partial', amountMinor: 5000 });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'pending',
      partnerAmountMinor: 4500,
    });
  });

  it('Pix pendente: o repasse espera o webhook; recusado, volta para o admin', async () => {
    const { service, entries, gateway } = await setup(undefined, 'pending');
    const claim = await service.open(CLAIM);
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('on_hold');
    await service.failRefund(claim.id);
    expect((await service.get(claim.id))?.status).toBe('open');
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(gateway.refundPayment).toHaveBeenLastCalledWith(
      expect.objectContaining({ idempotencyKey: `refund_claim_${claim.id}_2` })
    );
    await service.completeRefund(claim.id, 're_1');
    expect((await service.get(claim.id))?.status).toBe('refunded');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('canceled');
  });

  it('sem decisão em 5 dias, a reclamação expira e o repasse sai', async () => {
    const { service, entries, clock } = await setup();
    const claim = await service.open(CLAIM);
    clock.value = new Date('2026-12-26T09:59:00.000Z');
    expect(await service.expireDue()).toBe(0);
    clock.value = new Date('2026-12-26T10:00:00.000Z');
    expect(await service.expireDue()).toBe(1);
    expect((await service.get(claim.id))?.status).toBe('expired');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
  });

  it('reclamação e contestação juntas: o fim de uma não solta a outra', async () => {
    const { service, entries, payouts } = await setup();
    const claim = await service.open(CLAIM);
    await payouts.holdForDispute('pi_1');
    await service.decide(claim.id, 'admin-1', { outcome: 'release' });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'on_hold',
      holdReasons: ['dispute'],
    });
    await payouts.closeDispute('pi_1', 'won');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
  });
});
