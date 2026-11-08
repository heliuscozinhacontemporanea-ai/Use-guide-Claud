import { describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/bookings', () => ({ anonymizeBuyerBookingsUseCase: vi.fn() }));
vi.mock('../../domain/ticketing', () => ({ anonymizeTicketingUserUseCase: vi.fn() }));
vi.mock('../../domain/guide', () => ({ deleteResourcesByOwnerUseCase: vi.fn() }));
vi.mock('../../domain/events', () => ({ deleteEventsByOwnerUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({
  deleteOwnerListingPlansUseCase: vi.fn(),
  deleteOwnerListingVerificationsUseCase: vi.fn(),
  deletePartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/payment', () => ({ cancelPartnerPlanSubscriptionsUseCase: vi.fn() }));
vi.mock('../../domain/reviews', () => ({ deleteReviewsByUserUseCase: vi.fn() }));
vi.mock('../../domain/users', () => ({
  releaseUsernamesUseCase: vi.fn(),
  deleteUserAccountUseCase: vi.fn(),
}));
vi.mock('./listingVerification/deleteVerificationFiles', () => ({
  deleteVerificationFiles: vi.fn(),
}));

import { deleteUserAccountApplicationUseCase } from './deleteUserAccountApplicationUseCase';

describe('deleteUserAccountApplicationUseCase', () => {
  it('anonimiza as reservas do comprador antes de apagar a conta (§7.5, D20)', async () => {
    const calls: string[] = [];
    const step = (name: string) => async () => {
      calls.push(name);
    };
    await deleteUserAccountApplicationUseCase('user-1', {
      deleteReviewsByUser: step('reviews'),
      deleteResourcesByOwner: step('resources'),
      anonymizeBuyerBookings: step('bookings'),
      anonymizeTicketing: step('ticketing'),
      deletePartnerProfile: step('partner'),
      deleteUserAccount: step('account'),
    });
    expect(calls).toEqual(['reviews', 'resources', 'bookings', 'ticketing', 'partner', 'account']);
  });

  it('exige o UID', async () => {
    await expect(
      deleteUserAccountApplicationUseCase('', {
        deleteReviewsByUser: vi.fn(),
        deleteResourcesByOwner: vi.fn(),
        deletePartnerProfile: vi.fn(),
        deleteUserAccount: vi.fn(),
      })
    ).rejects.toThrow('UID');
  });
});
