import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', async () => {
  const { cancellationPenaltyMinor } = await import('../../../domain/payment/utils/debtRules');
  return {
    cancellationPenaltyMinor,
    createAccountDebtUseCase: vi.fn(async (input: { amountMinor: number }) => input),
    getPayoutEntryForReferenceUseCase: vi.fn(),
  };
});

import {
  createAccountDebtUseCase,
  getPayoutEntryForReferenceUseCase,
} from '../../../domain/payment';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';

function entry(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    accountKey: 'key-1',
    status: 'pending',
    grossMinor: 10600,
    serviceFeeMinor: 600,
    refunds: {},
    ...overrides,
  };
}

describe('chargeCancellationPenaltyApplicationUseCase (D14, D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('20% do vendido sem a taxa de serviço, descontando reembolsos e ignorando cancelados', async () => {
    vi.mocked(getPayoutEntryForReferenceUseCase).mockImplementation(async (_type, id) => {
      if (id === 'ord-1') return entry('po_1') as never;
      if (id === 'ord-2') {
        return entry('po_2', {
          refunds: { r1: { amountMinor: 5300, serviceFeeMinor: 300, at: '' } },
        }) as never;
      }
      if (id === 'ord-3') return entry('po_3', { status: 'canceled' }) as never;
      return null;
    });
    const total = await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'event_occurrence',
      referenceId: 'occ-1',
      sales: ['ord-1', 'ord-2', 'ord-3', 'ord-4'].map((referenceId) => ({
        referenceType: 'ticket_order' as const,
        referenceId,
      })),
    });
    // (10000 + 5000) × 20%
    expect(total).toBe(3000);
    expect(createAccountDebtUseCase).toHaveBeenCalledWith({
      accountKey: 'key-1',
      reason: 'cancellation_penalty',
      referenceType: 'event_occurrence',
      referenceId: 'occ-1_key-1',
      amountMinor: 3000,
    });
  });

  it('uma multa por CNPJ', async () => {
    vi.mocked(getPayoutEntryForReferenceUseCase).mockImplementation(
      async (_type, id) => entry(`po_${id}`, { accountKey: `key-${id}` }) as never
    );
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'booking_slot',
      referenceId: 'slot-1',
      sales: [
        { referenceType: 'booking', referenceId: 'a' },
        { referenceType: 'booking', referenceId: 'b' },
      ],
    });
    expect(createAccountDebtUseCase).toHaveBeenCalledTimes(2);
  });
});
