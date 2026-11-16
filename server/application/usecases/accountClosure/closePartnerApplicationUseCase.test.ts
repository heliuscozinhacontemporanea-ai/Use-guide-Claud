import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', () => ({ archiveOffersByOwnerUseCase: vi.fn() }));
vi.mock('../../../domain/guide', () => ({ deleteResourcesByOwnerUseCase: vi.fn() }));
vi.mock('../../../domain/partners', () => ({
  deleteOwnerListingPlansUseCase: vi.fn(),
  deleteOwnerListingVerificationsUseCase: vi.fn(),
  deletePartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', () => ({ cancelPartnerPlanSubscriptionsUseCase: vi.fn() }));
vi.mock('./listAccountClosureBlockersApplicationUseCase', () => ({
  listAccountClosureBlockersApplicationUseCase: vi.fn(),
}));
vi.mock('./closeOwnerEventsApplicationUseCase', () => ({
  closeOwnerEventsApplicationUseCase: vi.fn(),
}));
vi.mock('../listingVerification/deleteVerificationFiles', () => ({
  deleteVerificationFiles: vi.fn(),
}));

import { AccountClosureBlockedError } from './accountClosureBlockedError';
import {
  closePartnerApplicationUseCase,
  type PartnerClosureDependencies,
} from './closePartnerApplicationUseCase';

function deps(blockers: string[] = []) {
  const calls: string[] = [];
  const step = (name: string) => async () => {
    calls.push(name);
  };
  const d: PartnerClosureDependencies = {
    listBlockers: async () => blockers,
    archiveOffers: step('offers'),
    deleteListings: step('listings'),
    closeEvents: step('events'),
    deleteVerifications: step('verifications'),
    deletePlans: step('plans'),
    deletePartnerProfile: step('profile'),
  };
  return { d, calls };
}

describe('closePartnerApplicationUseCase (travas de 2026-11-16)', () => {
  it('com vendas em andamento, recusa e não apaga nada', async () => {
    const { d, calls } = deps(['bookings', 'payouts']);
    const error = await closePartnerApplicationUseCase('owner-1', d).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AccountClosureBlockedError);
    expect(error).toMatchObject({
      code: 'ACCOUNT_HAS_ACTIVE_SALES',
      blockers: ['bookings', 'payouts'],
    });
    expect(calls).toEqual([]);
  });

  it('sem vendas, tira as ofertas do app antes de apagar os anúncios e o perfil por último', async () => {
    const { d, calls } = deps();
    await closePartnerApplicationUseCase('owner-1', d);
    expect(calls).toEqual(['offers', 'listings', 'events', 'verifications', 'plans', 'profile']);
  });

  it('exige o UID', async () => {
    await expect(closePartnerApplicationUseCase('', deps().d)).rejects.toThrow('UID');
  });
});
