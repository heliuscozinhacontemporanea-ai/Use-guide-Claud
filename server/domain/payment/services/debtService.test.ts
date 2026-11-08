import { describe, expect, it, vi } from 'vitest';
import { InMemoryAccountDebtAdapter } from '../adapters/inMemoryAccountDebtAdapter';
import { cancellationPenaltyMinor } from '../utils/debtRules';
import { DebtService } from './debtService';

const PENALTY = {
  accountKey: 'key-1',
  reason: 'cancellation_penalty' as const,
  referenceType: 'event_occurrence',
  referenceId: 'occ-1',
  amountMinor: 2000,
};

function setup(now = '2026-10-25T12:00:00.000Z') {
  const repo = new InMemoryAccountDebtAdapter();
  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      paymentIntentId: 'pi_debt',
      clientSecret: 'cs_debt',
      status: 'requires_payment_method',
    }),
  };
  const clock = { value: new Date(now) };
  const service = new DebtService(repo, gateway, () => clock.value);
  return { repo, gateway, clock, service };
}

describe('DebtService (D16)', () => {
  it('multa de 20% arredondada para baixo', () => {
    expect(cancellationPenaltyMinor(10_000)).toBe(2000);
    expect(cancellationPenaltyMinor(1_999)).toBe(399);
    expect(cancellationPenaltyMinor(-5)).toBe(0);
  });

  it('a mesma referência gera uma dívida só, que vence em 24 h', async () => {
    const { service, repo } = setup();
    await service.createDebt(PENALTY);
    await service.createDebt(PENALTY);
    expect(repo.rows.size).toBe(1);
    expect([...repo.rows.values()][0]?.dueAt).toBe('2026-10-26T12:00:00.000Z');
    expect(await service.createDebt({ ...PENALTY, referenceId: 'occ-2', amountMinor: 0 })).toBe(
      null
    );
  });

  it('só bloqueia depois do vencimento', async () => {
    const { service, clock } = setup();
    await service.createDebt(PENALTY);
    expect(await service.hasOverdueDebt('key-1')).toBe(false);
    clock.value = new Date('2026-10-26T12:00:00.000Z');
    expect(await service.hasOverdueDebt('key-1')).toBe(true);
    expect(await service.hasOverdueDebt('key-2')).toBe(false);
  });

  it('desconta do repasse só a dívida vencida, uma vez por entrada', async () => {
    const { service, repo, clock } = setup();
    await service.createDebt(PENALTY);
    const before = { accountKey: 'key-1', payoutEntryId: 'po_1', availableMinor: 1500 };
    expect(await service.offsetFromPayout(before)).toBe(0);
    clock.value = new Date('2026-10-27T00:00:00.000Z');
    expect(await service.offsetFromPayout(before)).toBe(1500);
    expect(await service.offsetFromPayout(before)).toBe(1500);
    const debt = [...repo.rows.values()][0];
    expect(debt).toMatchObject({ status: 'open', offsets: { po_1: 1500 } });
    expect(
      await service.offsetFromPayout({ ...before, payoutEntryId: 'po_2', availableMinor: 9000 })
    ).toBe(500);
    expect([...repo.rows.values()][0]?.status).toBe('paid');
  });

  it('pagamento: dívida de outro CNPJ responde 404 e a cobrança leva só IDs', async () => {
    const { service, gateway } = setup();
    const debt = await service.createDebt(PENALTY);
    await expect(service.startPayment(debt?.id ?? '', ['key-2'])).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
    await expect(service.startPayment(debt?.id ?? '', ['key-1'])).resolves.toEqual({
      clientSecret: 'cs_debt',
    });
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 2000,
        metadata: { referenceType: 'account_debt', referenceId: debt?.id, accountKey: 'key-1' },
        idempotencyKey: `pi_debt_${debt?.id}_2000`,
      })
    );
  });

  it('paga pelo webhook não pode ser cobrada de novo; perdão só de dívida aberta', async () => {
    const { service } = setup();
    const debt = await service.createDebt(PENALTY);
    const id = debt?.id ?? '';
    await service.markPaid(id, 'pi_debt');
    await expect(service.startPayment(id, ['key-1'])).rejects.toMatchObject({
      code: 'DEBT_ALREADY_SETTLED',
    });
    await expect(service.waive(id, 'admin-1')).rejects.toMatchObject({
      code: 'DEBT_ALREADY_SETTLED',
    });
    await expect(service.waive('debt-inexistente', 'admin-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  describe('força maior (3A)', () => {
    const DECLARATION = {
      reason: 'Vento acima de 40 nós, travessia proibida pela Capitania.',
      proofPath: 'verification/owner-1/prova.pdf',
      declaredBy: 'owner-1',
    };

    it('suspende a multa: não vence, não bloqueia, não é descontada nem cobrada', async () => {
      const { service, clock } = setup();
      const debt = await service.createDebt(PENALTY);
      const id = debt?.id ?? '';
      await expect(service.declareForceMajeure(id, ['key-2'], DECLARATION)).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      const view = await service.declareForceMajeure(id, ['key-1'], DECLARATION);
      expect(view).toMatchObject({ status: 'suspended', forceMajeureStatus: 'pending' });
      await expect(service.declareForceMajeure(id, ['key-1'], DECLARATION)).rejects.toMatchObject({
        code: 'FORCE_MAJEURE_ALREADY_DECLARED',
      });
      clock.value = new Date('2026-10-28T00:00:00.000Z');
      expect(await service.hasOverdueDebt('key-1')).toBe(false);
      expect(
        await service.offsetFromPayout({
          accountKey: 'key-1',
          payoutEntryId: 'po_1',
          availableMinor: 9000,
        })
      ).toBe(0);
      await expect(service.startPayment(id, ['key-1'])).rejects.toMatchObject({
        code: 'DEBT_SUSPENDED',
      });
      const [review] = await service.listForceMajeureReviews(10);
      expect(review).toMatchObject({ id, forceMajeureReason: DECLARATION.reason });
      expect(await service.getForceMajeureProofPath(id)).toBe(DECLARATION.proofPath);
    });

    it('só na multa de cancelamento e antes do vencimento', async () => {
      const { service, clock } = setup();
      const dispute = await service.createDebt({ ...PENALTY, reason: 'dispute_lost' });
      await expect(
        service.declareForceMajeure(dispute?.id ?? '', ['key-1'], DECLARATION)
      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_NOT_ALLOWED' });
      const penalty = await service.createDebt(PENALTY);
      clock.value = new Date('2026-10-26T12:00:00.000Z');
      await expect(
        service.declareForceMajeure(penalty?.id ?? '', ['key-1'], DECLARATION)
      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_TOO_LATE' });
    });

    it('aprovada perdoa a multa; recusada volta a valer com 24 h', async () => {
      const approved = setup();
      const first = await approved.service.createDebt(PENALTY);
      await approved.service.declareForceMajeure(first?.id ?? '', ['key-1'], DECLARATION);
      await expect(
        approved.service.decideForceMajeure(first?.id ?? '', 'admin-1', true)
      ).resolves.toMatchObject({ status: 'waived', waivedBy: 'admin-1' });
      await expect(
        approved.service.decideForceMajeure(first?.id ?? '', 'admin-1', false)
      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_NOT_PENDING' });

      const rejected = setup();
      const second = await rejected.service.createDebt(PENALTY);
      await rejected.service.declareForceMajeure(second?.id ?? '', ['key-1'], DECLARATION);
      rejected.clock.value = new Date('2026-10-27T08:00:00.000Z');
      const debt = await rejected.service.decideForceMajeure(second?.id ?? '', 'admin-1', false);
      expect(debt).toMatchObject({ status: 'open', dueAt: '2026-10-28T08:00:00.000Z' });
      expect(debt.forceMajeure?.status).toBe('rejected');
    });
  });

  it('admin vê as dívidas em aberto, das mais antigas, por página', async () => {
    const { service, clock } = setup();
    for (const id of ['occ-1', 'occ-2', 'occ-3']) {
      await service.createDebt({ ...PENALTY, referenceId: id });
      clock.value = new Date(clock.value.getTime() + 60_000);
    }
    const first = await service.listOpenForAdmin(2);
    expect(first.data.map((debt) => debt.id)).toEqual([
      'debt_cancellation_penalty_event_occurrence_occ-1',
      'debt_cancellation_penalty_event_occurrence_occ-2',
    ]);
    const second = await service.listOpenForAdmin(2, first.nextCursor ?? undefined);
    expect(second.data.map((debt) => debt.id)).toEqual([
      'debt_cancellation_penalty_event_occurrence_occ-3',
    ]);
    expect(second.nextCursor).toBeNull();
    await service.waive(first.data[0]?.id ?? '', 'admin-1');
    expect((await service.listOpenForAdmin(10)).data).toHaveLength(2);
  });
});
