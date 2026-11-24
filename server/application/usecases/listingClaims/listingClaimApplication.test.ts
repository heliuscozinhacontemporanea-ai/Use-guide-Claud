import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getItemByIdUseCase: vi.fn(),
  transferGuideItemOwnerUseCase: vi.fn(),
  isOwnVerificationFileUseCase: vi.fn(() => true),
  getUserProfileUseCase: vi.fn(),
  registerPartnerApplicationUseCase: vi.fn(),
  submitListingClaimUseCase: vi.fn(async () => ({ claimId: 'item-1_ana', status: 'pending' })),
  getPendingListingClaimUseCase: vi.fn(),
  completeListingClaimApprovalUseCase: vi.fn(async () => [] as unknown[]),
  getApprovedListingClaimUseCase: vi.fn(),
  completeListingClaimReturnUseCase: vi.fn(),
  deleteListingPlanUseCase: vi.fn(),
  getListingPlanUntilUseCase: vi.fn(async () => null as string | null),
  rejectListingClaimUseCase: vi.fn(),
  linkOwnerBusiness: vi.fn(),
  unlinkOwnerBusiness: vi.fn(),
  syncListingSealApplicationUseCase: vi.fn(),
  createNotificationUseCase: vi.fn(),
  hasActiveBookingsForGuideItemUseCase: vi.fn(async () => false),
  archiveOffersOfGuideItemUseCase: vi.fn(),
  countOpenEstablishmentEventsUseCase: vi.fn(async () => 0),
}));

vi.mock('../../../domain/guide', () => ({
  getItemByIdUseCase: m.getItemByIdUseCase,
  transferGuideItemOwnerUseCase: m.transferGuideItemOwnerUseCase,
}));
vi.mock('../../../domain/media', () => ({
  isOwnVerificationFileUseCase: m.isOwnVerificationFileUseCase,
}));
vi.mock('../../../domain/users', () => ({ getUserProfileUseCase: m.getUserProfileUseCase }));
vi.mock('../registerPartnerApplicationUseCase', () => ({
  registerPartnerApplicationUseCase: m.registerPartnerApplicationUseCase,
}));
vi.mock('../ownerBusinessLink', () => ({
  linkOwnerBusiness: m.linkOwnerBusiness,
  unlinkOwnerBusiness: m.unlinkOwnerBusiness,
}));
vi.mock('../listingPlans/syncListingSealApplicationUseCase', () => ({
  syncListingSealApplicationUseCase: m.syncListingSealApplicationUseCase,
}));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: m.createNotificationUseCase,
}));
vi.mock('../../../domain/bookings', () => ({
  hasActiveBookingsForGuideItemUseCase: m.hasActiveBookingsForGuideItemUseCase,
  archiveOffersOfGuideItemUseCase: m.archiveOffersOfGuideItemUseCase,
}));
vi.mock('../../../domain/events', () => ({
  countOpenEstablishmentEventsUseCase: m.countOpenEstablishmentEventsUseCase,
}));
vi.mock('../../../domain/partners', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../domain/partners')>();
  return {
    ListingClaimError: actual.ListingClaimError,
    toListingClaimView: actual.toListingClaimView,
    submitListingClaimUseCase: m.submitListingClaimUseCase,
    getPendingListingClaimUseCase: m.getPendingListingClaimUseCase,
    completeListingClaimApprovalUseCase: m.completeListingClaimApprovalUseCase,
    getApprovedListingClaimUseCase: m.getApprovedListingClaimUseCase,
    completeListingClaimReturnUseCase: m.completeListingClaimReturnUseCase,
    deleteListingPlanUseCase: m.deleteListingPlanUseCase,
    getListingPlanUntilUseCase: m.getListingPlanUntilUseCase,
    rejectListingClaimUseCase: m.rejectListingClaimUseCase,
  };
});

import { returnListingClaimApplicationUseCase } from './returnListingClaimApplicationUseCase';
import { reviewListingClaimApplicationUseCase } from './reviewListingClaimApplicationUseCase';
import { submitListingClaimApplicationUseCase } from './submitListingClaimApplicationUseCase';

const admin = { uid: 'admin-1', admin: true };
const input = {
  documentType: 'cnpj' as const,
  document: '11.222.333/0001-81',
  holderRole: 'owner' as const,
  files: { cnpjCard: 'a', identity: 'b' },
};
const claim = {
  claimId: 'item-1_ana',
  itemId: 'item-1',
  claimantId: 'ana',
  documentType: 'cnpj',
  document: { v: 1, kid: 'k', iv: 'i', tag: 't', ct: 'c' },
  documentIndex: 'idx',
  maskedDocument: '**.***.333/0001-81',
  holderRole: 'owner',
  files: { cnpjCard: 'a', identity: 'b', authorization: null },
  cadastur: null,
  status: 'pending',
  rejectionReason: null,
  submittedAt: '2026-11-24T10:00:00.000Z',
  reviewedAt: null,
  reviewedBy: null,
};

describe('"Sou o dono" na aplicação (D35)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getItemByIdUseCase.mockResolvedValue({
      id: 'item-1',
      name: 'Cantinho do Preá',
      ownerId: 'useguide',
      category: 'restaurant',
      publication: 'published',
      isActive: true,
    });
  });

  it('exige e-mail confirmado e, para quem não é parceiro, os Termos do parceiro', async () => {
    await expect(
      submitListingClaimApplicationUseCase({ uid: 'ana', emailVerified: false }, 'item-1', input)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    m.getUserProfileUseCase.mockResolvedValue({ role: 'user' });
    await expect(
      submitListingClaimApplicationUseCase({ uid: 'ana', emailVerified: true }, 'item-1', input)
    ).rejects.toMatchObject({ code: 'TERMS_REQUIRED' });
    expect(m.submitListingClaimUseCase).not.toHaveBeenCalled();
  });

  it('quem não é parceiro vira parceiro depois de o pedido ser aceito pelo servidor', async () => {
    m.getUserProfileUseCase.mockResolvedValue({ role: 'user' });
    await submitListingClaimApplicationUseCase({ uid: 'ana', emailVerified: true }, 'item-1', {
      ...input,
      termsAccepted: true,
    });
    expect(m.submitListingClaimUseCase).toHaveBeenCalledWith(
      'ana',
      expect.objectContaining({ ownerId: 'useguide' }),
      expect.not.objectContaining({ termsAccepted: true })
    );
    expect(m.registerPartnerApplicationUseCase).toHaveBeenCalled();
  });

  it('recusa arquivo que não foi enviado por quem pede', async () => {
    m.isOwnVerificationFileUseCase.mockReturnValueOnce(false);
    await expect(
      submitListingClaimApplicationUseCase({ uid: 'ana', emailVerified: true }, 'item-1', input)
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('aprovar passa o anúncio, tira o plano e o selo do Use Guide e avisa os dois lados', async () => {
    m.getPendingListingClaimUseCase.mockResolvedValue(claim);
    m.transferGuideItemOwnerUseCase.mockResolvedValue(true);
    m.completeListingClaimApprovalUseCase.mockResolvedValue([
      { ...claim, claimId: 'item-1_bruno', claimantId: 'bruno', status: 'rejected' },
    ]);
    const view = await reviewListingClaimApplicationUseCase(admin, claim.claimId, 'approve', null);
    expect(view.status).toBe('approved');
    expect(m.transferGuideItemOwnerUseCase).toHaveBeenCalledWith('item-1', 'useguide', 'ana');
    expect(m.linkOwnerBusiness).toHaveBeenCalledWith(
      'ana',
      expect.objectContaining({ businessId: 'item-1' })
    );
    expect(m.deleteListingPlanUseCase).toHaveBeenCalledWith('item-1');
    expect(m.syncListingSealApplicationUseCase).toHaveBeenCalledWith('item-1');
    const types = m.createNotificationUseCase.mock.calls.map(([n]) => [n.recipientUid, n.type]);
    expect(types).toEqual([
      ['ana', 'listing_claim_approved'],
      ['bruno', 'listing_claim_rejected'],
    ]);
    expect(JSON.stringify(view)).not.toContain('"document"');
  });

  it('não aprova se o anúncio já tiver outro dono', async () => {
    m.getPendingListingClaimUseCase.mockResolvedValue(claim);
    m.transferGuideItemOwnerUseCase.mockResolvedValue(false);
    await expect(
      reviewListingClaimApplicationUseCase(admin, claim.claimId, 'approve', null)
    ).rejects.toMatchObject({ code: 'LISTING_NOT_CLAIMABLE' });
    expect(m.completeListingClaimApprovalUseCase).not.toHaveBeenCalled();
  });

  it('devolve ao Use Guide só sem reservas, eventos ou plano do novo dono', async () => {
    m.getApprovedListingClaimUseCase.mockResolvedValue({ ...claim, status: 'approved' });
    m.hasActiveBookingsForGuideItemUseCase.mockResolvedValueOnce(true);
    await expect(returnListingClaimApplicationUseCase(admin, claim.claimId)).rejects.toMatchObject({
      code: 'LISTING_IN_USE',
    });
    m.transferGuideItemOwnerUseCase.mockResolvedValue(true);
    m.completeListingClaimReturnUseCase.mockResolvedValue({ ...claim, status: 'returned' });
    const view = await returnListingClaimApplicationUseCase(admin, claim.claimId);
    expect(view.status).toBe('returned');
    expect(m.transferGuideItemOwnerUseCase).toHaveBeenCalledWith('item-1', 'ana', 'useguide');
    expect(m.archiveOffersOfGuideItemUseCase).toHaveBeenCalledWith('item-1');
    expect(m.unlinkOwnerBusiness).toHaveBeenCalledWith('ana', 'item-1');
  });
});
