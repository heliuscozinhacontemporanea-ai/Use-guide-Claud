import { describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/bookings', () => ({
  anonymizeBuyerBookingsUseCase: vi.fn(),
  archiveOffersByOwnerUseCase: vi.fn(),
}));
vi.mock('./accountClosure/closePartnerApplicationUseCase', () => ({
  assertAccountCanCloseApplicationUseCase: vi.fn(),
}));
vi.mock('./accountClosure/closeOwnerEventsApplicationUseCase', () => ({
  closeOwnerEventsApplicationUseCase: vi.fn(),
}));
vi.mock('../../domain/ticketing', () => ({ anonymizeTicketingUserUseCase: vi.fn() }));
vi.mock('../../domain/guide', () => ({ deleteResourcesByOwnerUseCase: vi.fn() }));
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

import { AccountClosureBlockedError } from './accountClosure/accountClosureBlockedError';
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

  it('com vendas em andamento como parceiro, recusa antes de apagar qualquer coisa', async () => {
    const calls: string[] = [];
    const step = (name: string) => async () => {
      calls.push(name);
    };
    await expect(
      deleteUserAccountApplicationUseCase('user-1', {
        assertCanClose: async () => {
          throw new AccountClosureBlockedError(['sessions']);
        },
        deleteReviewsByUser: step('reviews'),
        deleteResourcesByOwner: step('resources'),
        archiveOffersByOwner: step('offers'),
        deletePartnerProfile: step('partner'),
        deleteUserAccount: step('account'),
      })
    ).rejects.toMatchObject({ code: 'ACCOUNT_HAS_ACTIVE_SALES', blockers: ['sessions'] });
    expect(calls).toEqual([]);
  });

  it('liberada, tira as ofertas do app antes de apagar os anúncios', async () => {
    const calls: string[] = [];
    const step = (name: string) => async () => {
      calls.push(name);
    };
    await deleteUserAccountApplicationUseCase('user-1', {
      assertCanClose: step('assert'),
      deleteReviewsByUser: step('reviews'),
      archiveOffersByOwner: step('offers'),
      deleteResourcesByOwner: step('resources'),
      deleteEventsByOwner: step('events'),
      deletePartnerProfile: step('partner'),
      deleteUserAccount: step('account'),
    });
    expect(calls).toEqual([
      'assert',
      'reviews',
      'offers',
      'resources',
      'events',
      'partner',
      'account',
    ]);
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
