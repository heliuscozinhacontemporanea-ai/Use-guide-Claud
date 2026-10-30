import { describe, expect, it, vi } from 'vitest';
import { InMemoryPayoutEntryAdapter } from '../adapters/inMemoryPayoutEntryAdapter';
import { InMemoryAccountDebtAdapter } from '../adapters/inMemoryAccountDebtAdapter';
import { DebtService } from './debtService';
import { PayoutService, type RecordSaleInput } from './payoutService';

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
  const repo = new InMemoryPayoutEntryAdapter();
  const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
  const accounts = { getPayoutDestination: vi.fn().mockResolvedValue(destination) };
  const clock = { value: new Date(now) };
  const debtRows = new InMemoryAccountDebtAdapter();
  const debts = new DebtService(debtRows, { createPaymentIntent: vi.fn() }, () => clock.value);
  const service = new PayoutService(repo, transfers, accounts, debts, () => clock.value);
  return { repo, transfers, accounts, service, clock, debts, debtRows };
}

describe('PayoutService (D14)', () => {
  it('venda que espera a prova do serviço nasce retida e só sai depois de soltar (D20)', async () => {
    const { service, repo, transfers } = setup();
    const entry = await service.recordSale({ ...SALE, holdReasons: ['service_proof'] });
    expect(entry).toMatchObject({ status: 'on_hold', holdReasons: ['service_proof'] });
    await service.releaseDue();
    expect(transfers.createTransfer).not.toHaveBeenCalled();
    await service.releaseHold('ticket_order', 'ord_1', 'service_proof');
    expect(repo.rows.get(entry.id)?.status).toBe('pending');
    await service.releaseDue();
    expect(transfers.createTransfer).toHaveBeenCalledTimes(1);
  });

  it('soltar a prova mantém a reclamação que também retém a venda', async () => {
    const { service, repo } = setup();
    const entry = await service.recordSale({ ...SALE, holdReasons: ['service_proof'] });
    await service.setHold(entry.id, 'claim', true);
    await service.releaseHold('ticket_order', 'ord_1', 'service_proof');
    expect(repo.rows.get(entry.id)).toMatchObject({ status: 'on_hold', holdReasons: ['claim'] });
    await expect(service.releaseHold('booking', 'nao_existe', 'service_proof')).resolves.toBeNull();
  });

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

  it('contestação segura o repasse; ganha ou a plataforma arca volta à fila, sem prova cancela', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    await service.holdForDispute('pi_1');
    expect((await service.releaseDue()).released).toBe(0);
    await service.closeDispute('pi_1', 'won');
    expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
    await service.holdForDispute('pi_1');
    await service.closeDispute('pi_1', 'lost_platform_absorbs');
    expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
    await service.holdForDispute('pi_1');
    await service.closeDispute('pi_1', 'lost_partner_pays');
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'canceled',
      canceledReason: 'dispute_lost',
      partnerAmountMinor: 0,
    });
  });

  it('contestação perdida sem prova depois do repasse vira dívida do CNPJ (D16)', async () => {
    const { service, debtRows } = setup();
    await service.recordSale(SALE);
    await service.releaseDue();
    await service.closeDispute('pi_1', 'lost_platform_absorbs');
    expect(debtRows.rows.size).toBe(0);
    await service.closeDispute('pi_1', 'lost_partner_pays');
    expect([...debtRows.rows.values()]).toEqual([
      expect.objectContaining({ reason: 'dispute_lost', accountKey: 'key-1', amountMinor: 9000 }),
    ]);
  });

  it('reembolso depois do repasse vira dívida pela diferença (B29)', async () => {
    const { service, repo, debtRows } = setup();
    await service.recordSale(SALE);
    await service.releaseDue();
    const refund = { ...SALE, refundKey: 'ref_1', amountMinor: 5300, serviceFeeMinor: 300 };
    await service.applyRefund(refund);
    await service.applyRefund(refund);
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'released',
      partnerAmountMinor: 4500,
    });
    expect([...debtRows.rows.values()]).toEqual([
      expect.objectContaining({ reason: 'post_release_refund', amountMinor: 4500 }),
    ]);
  });

  it('dívida vencida sai do repasse e a transferência leva o resto', async () => {
    const { service, transfers, debts, repo, clock } = setup('2026-12-20T00:00:00.000Z');
    await debts.createDebt({
      accountKey: 'key-1',
      reason: 'cancellation_penalty',
      referenceType: 'booking_slot',
      referenceId: 'slot-1',
      amountMinor: 2500,
    });
    await service.recordSale(SALE);
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    await service.releaseDue();
    expect(transfers.createTransfer).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 6500 })
    );
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'released',
      offsetMinor: 2500,
    });
  });

  it('dívida que consome todo o repasse: libera sem transferir', async () => {
    const { service, transfers, debts, repo, clock } = setup('2026-12-20T00:00:00.000Z');
    await debts.createDebt({
      accountKey: 'key-1',
      reason: 'dispute_lost',
      referenceType: 'ticket_order',
      referenceId: 'ord_0',
      amountMinor: 20000,
    });
    await service.recordSale(SALE);
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    expect((await service.releaseDue()).released).toBe(1);
    expect(transfers.createTransfer).not.toHaveBeenCalled();
    expect(repo.rows.get('po_ticket_order_ord_1')?.offsetMinor).toBe(9000);
  });

  it('reagendamento move o prazo do repasse para 48 h depois da nova data (D16)', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    await service.reschedule('ticket_order', 'ord_1', '2026-12-28T03:00:00.000Z');
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      serviceEndsAt: '2026-12-28T03:00:00.000Z',
      releaseAt: '2026-12-30T03:00:00.000Z',
    });
    expect((await service.releaseDue()).released).toBe(0);
  });

  it('extrato: só os CNPJs pedidos, mais recentes primeiro, sem IDs do Stripe', async () => {
    const { service, clock } = setup('2026-12-01T00:00:00.000Z');
    await service.recordSale({ ...SALE, title: 'Festival' });
    clock.value = new Date('2026-12-02T00:00:00.000Z');
    await service.recordSale({ ...SALE, referenceId: 'ord_2', paymentIntentId: 'pi_2' });
    await service.recordSale({
      ...SALE,
      referenceId: 'ord_3',
      paymentIntentId: 'pi_3',
      accountKey: 'key-2',
    });
    const first = await service.listForAccounts(['key-1'], 1);
    expect(first.data.map((entry) => entry.referenceId)).toEqual(['ord_2']);
    expect(first.nextCursor).toBe('po_ticket_order_ord_2');
    const second = await service.listForAccounts(['key-1'], 1, first.nextCursor ?? undefined);
    expect(second.data[0]).toMatchObject({ referenceId: 'ord_1', title: 'Festival' });
    expect(JSON.stringify(second.data)).not.toMatch(/pi_|ch_|chargeId|paymentIntentId/);
    // 106,00 = 6,00 de taxa de serviço + 10,00 de taxa da plataforma + 90,00 do proprietário.
    expect(second.data[0]).toMatchObject({
      grossMinor: 10600,
      serviceFeeMinor: 600,
      platformFeeMinor: 1000,
      partnerAmountMinor: 9000,
    });
  });
});
