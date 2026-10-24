import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ load: vi.fn(), status: vi.fn(), assert: vi.fn(), until: vi.fn() }));

vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return {
    ListingPlanError,
    assertListingPlanPurchasableUseCase: m.assert,
    getListingPlanUntilUseCase: m.until,
    getListingVerificationStatusUseCase: m.status,
  };
});
vi.mock('./loadPlanListing', () => ({ loadPlanListing: m.load }));

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { PaymentDomainError } from '../../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './assertListingPlanPurchasableApplicationUseCase';

describe('assertListingPlanPurchasableApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.load.mockResolvedValue({ id: 'item-1', ownerId: 'p1' });
    m.status.mockResolvedValue('approved');
  });

  it('devolve a validade do plano em vigor para não cobrar duas vezes', async () => {
    m.until.mockResolvedValue('2026-12-01T00:00:00.000Z');
    await expect(
      assertListingPlanPurchasableApplicationUseCase({ uid: 'p1' }, 'item-1')
    ).resolves.toEqual({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
  });

  it('erro do plano sai como PaymentDomainError com o mesmo código e status', async () => {
    m.assert.mockRejectedValue(
      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Verifique antes.')
    );
    const error = await assertListingPlanPurchasableApplicationUseCase(
      { uid: 'p1' },
      'item-1'
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PaymentDomainError);
    expect(error).toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
    expect(m.until).not.toHaveBeenCalled();
  });
});
