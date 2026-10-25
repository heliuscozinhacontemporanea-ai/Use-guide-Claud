import { describe, expect, it, vi } from 'vitest';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';
import { PayoutService, type RecordSaleInput } from './payoutService';

function memoryRepository(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
  const rows = new Map<string, PayoutEntry>();
  return {
    rows,
    async createIfAbsent(entry) {
      const existing = rows.get(entry.id);
      if (existing) return existing;
      rows.set(entry.id, entry);
      return entry;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async getByPaymentIntentId(id) {
      return [...rows.values()].find((entry) => entry.paymentIntentId === id) ?? null;
    },
    async listDue(nowIso, limit) {
      return [...rows.values()]
        .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
        .slice(0, limit);
    },
    async update(id, change) {
      const current = rows.get(id);
      if (!current) return null;
      const next = change(current);
      if (next) rows.set(id, next);
      return next ?? current;
    },
  };
}

const SALE: RecordSaleInput = {
  referenceType: 'ticket_order',
  referenceId: 'ord_1',
  accountKey: 'key-1',
  paymentIntentId: 'pi_1',
  chargeId: 'ch_1',
  grossMinor: 10600,
  serviceFeeMinor: 600,
  platformFeeMinor: 1000,
  serviceEndsAt: '2026-12-21T03:00:00.000Z',
};

function setup(now = '2026-12-23T04:00:00.000Z', destination: string | null = 'acct_1') {
  const repo = memoryRepository();
  const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
  const accounts = { getPayoutDestination: vi.fn().mockResolvedValue(destination) };
  const clock = { value: new Date(now) };
  const service = new PayoutService(repo, transfers, accounts, () => clock.value);
  return { repo, transfers, accounts, service, clock };
}

describe('PayoutService (D14)', () => {
  it('registra a venda uma vez, com liberação 48 h depois do fim', async () => {
    const { service, repo } = setup();
    const entry = await service.recordSale(SALE);
    await service.recordSale(SALE);
    expect(repo.rows.size).toBe(1);
    expect(entry).toMatchObject({
      status: 'pending',
      partnerAmountMinor: 9000,
      releaseAt: '2026-12-23T03:00:00.000Z',
    });
  });

  it('não libera antes do prazo; depois transfere com a cobrança de origem e idempotência', async () => {
    const { service, transfers, clock } = setup('2026-12-23T02:00:00.000Z');
    await service.recordSale(SALE);
    expect(await service.releaseDue()).toEqual({ released: 0, waitingAccount: 0, failed: 0 });
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    expect((await service.releaseDue()).released).toBe(1);
    expect(transfers.createTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 9000,
        destinationAccountId: 'acct_1',
        sourceChargeId: 'ch_1',
        idempotencyKey: 'tr_po_ticket_order_ord_1',
      })
    );
    expect((await service.releaseDue()).released).toBe(0);
  });

  it('conta sem repasses habilitados: a entrada espera', async () => {
    const { service, transfers } = setup(undefined, null);
    await service.recordSale(SALE);
    expect(await service.releaseDue()).toEqual({ released: 0, waitingAccount: 1, failed: 0 });
    expect(transfers.createTransfer).not.toHaveBeenCalled();
  });

  it('reembolso antes do repasse recalcula a parte do proprietário e conta uma vez', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    const refund = { ...SALE, refundKey: 'ref_1', amountMinor: 5300, serviceFeeMinor: 300 };
    await service.applyRefund(refund);
    await service.applyRefund(refund);
    expect(repo.rows.get('po_ticket_order_ord_1')?.partnerAmountMinor).toBe(4500);
    await service.applyRefund({ ...refund, refundKey: 'ref_2' });
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'canceled',
      canceledReason: 'fully_refunded',
      partnerAmountMinor: 0,
    });
  });

  it('contestação segura o repasse; ganha volta à fila, perdida cancela', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    await service.holdForDispute('pi_1');
    expect((await service.releaseDue()).released).toBe(0);
    await service.closeDispute('pi_1', true);
    expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
    await service.holdForDispute('pi_1');
    await service.closeDispute('pi_1', false);
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'canceled',
      canceledReason: 'dispute_lost',
    });
  });
});
