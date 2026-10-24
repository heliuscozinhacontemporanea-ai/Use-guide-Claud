import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/partners', async () => {
  const actual = await vi.importActual<typeof import('../../../domain/partners')>(
    '../../../domain/partners'
  );
  return {
    ...actual,
    assertListingPlanPurchasableUseCase: vi.fn(),
    getListingPlanUntilUseCase: vi.fn(),
    getListingVerificationStatusUseCase: vi.fn(),
  };
});
vi.mock('./loadPlanListing', () => ({ loadPlanListing: vi.fn() }));

import {
  assertListingPlanPurchasableUseCase,
  getListingPlanUntilUseCase,
  getListingVerificationStatusUseCase,
  ListingPlanError,
} from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './assertListingPlanPurchasableApplicationUseCase';
import { loadPlanListing } from './loadPlanListing';

describe('assertListingPlanPurchasableApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadPlanListing).mockResolvedValue({ id: 'item-1', ownerId: 'p1' });
    vi.mocked(getListingVerificationStatusUseCase).mockResolvedValue('approved');
    vi.mocked(getListingPlanUntilUseCase).mockResolvedValue('2026-12-01T00:00:00.000Z');
  });

  it('devolve o fim do período já pago quando o item é do dono e o documento está aprovado', async () => {
    const result = await assertListingPlanPurchasableApplicationUseCase('p1', 'item-1');
    expect(assertListingPlanPurchasableUseCase).toHaveBeenCalledWith(
      { uid: 'p1' },
      { id: 'item-1', ownerId: 'p1' },
      'approved'
    );
    expect(result).toEqual({ currentPaidUntil: '2026-12-01T00:00:00.000Z' });
  });

  it('traduz LISTING_PENDING_VERIFICATION para 422', async () => {
    vi.mocked(assertListingPlanPurchasableUseCase).mockRejectedValueOnce(
      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Precisa verificar.')
    );
    await expect(
      assertListingPlanPurchasableApplicationUseCase('p1', 'item-1')
    ).rejects.toMatchObject({
      code: 'LISTING_PENDING_VERIFICATION',
      statusCode: 422,
    } satisfies Partial<PaymentDomainError>);
  });

  it('traduz item de outro dono para 403/404', async () => {
    vi.mocked(assertListingPlanPurchasableUseCase).mockRejectedValueOnce(
      new ListingPlanError('FORBIDDEN', 'Sem acesso.')
    );
    await expect(
      assertListingPlanPurchasableApplicationUseCase('intruso', 'item-1')
    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
  });
});
