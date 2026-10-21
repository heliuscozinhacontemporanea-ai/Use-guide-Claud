import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  status: vi.fn(),
  compute: vi.fn(),
  setActive: vi.fn(),
  updateItem: vi.fn(),
  updateEvents: vi.fn(),
  review: vi.fn(),
  linked: vi.fn(),
  expired: vi.fn(),
  expiring: vi.fn(),
  getItem: vi.fn(),
  notify: vi.fn(),
  trial: vi.fn(),
  view: vi.fn(),
  loadVerificationListing: vi.fn(),
}));

vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return {
    ListingPlanError,
    getListingVerificationStatusUseCase: m.status,
    computeListingSealUseCase: m.compute,
    setListingSealActiveUseCase: m.setActive,
    reviewListingVerificationUseCase: m.review,
    listLinkedListingIdsUseCase: m.linked,
    listExpiredListingSealsUseCase: m.expired,
    listExpiringListingSealsUseCase: m.expiring,
    activateListingTrialUseCase: m.trial,
    getListingPlanViewUseCase: m.view,
  };
});
vi.mock('../../../domain/guide', () => ({
  updateItemVerificationUseCase: m.updateItem,
  getItemByIdUseCase: m.getItem,
}));
vi.mock('../../../domain/events', () => ({
  updateEstablishmentEventsVerificationUseCase: m.updateEvents,
}));
vi.mock('../../../domain/notifications', () => ({ createNotificationUseCase: m.notify }));
vi.mock('../listingVerification/loadVerificationListing', () => ({
  loadVerificationListing: m.loadVerificationListing,
}));

import { activateListingTrialApplicationUseCase } from './activateListingTrialApplicationUseCase';
import { reviewListingVerificationApplicationUseCase } from './reviewListingVerificationApplicationUseCase';
import { runListingPlanMaintenanceApplicationUseCase } from './runListingPlanMaintenanceApplicationUseCase';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

const SEAL = {
  isVerified: true,
  verifiedUntil: '2026-11-21T12:00:00.000Z',
  verificationType: 'monthly',
  isVerificationSuspended: false,
};
const admin = { uid: 'admin-1', admin: true };

describe('casos de uso do plano por estabelecimento (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.status.mockResolvedValue('approved');
    m.compute.mockResolvedValue(SEAL);
    m.linked.mockResolvedValue([]);
    m.loadVerificationListing.mockResolvedValue({
      id: 'item-1',
      ownerId: 'owner-1',
      category: 'hotel',
    });
  });

  it('sync grava o selo no item, nos eventos do estabelecimento e marca o plano', async () => {
    await syncListingSealApplicationUseCase('item-1');
    expect(m.compute).toHaveBeenCalledWith('item-1', 'approved');
    expect(m.updateItem).toHaveBeenCalledWith('item-1', SEAL);
    expect(m.updateEvents).toHaveBeenCalledWith('item-1', SEAL);
    expect(m.setActive).toHaveBeenCalledWith('item-1', true);
  });

  it('revisão recalcula o selo do estabelecimento e dos perfis de produtor ligados', async () => {
    m.review.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    m.linked.mockResolvedValue(['item-3']);
    await reviewListingVerificationApplicationUseCase(admin, 'item-1', 'approve', null);
    expect(m.updateItem.mock.calls.map((call) => call[0])).toEqual(['item-1', 'item-3']);
  });

  it('trial: ativa no estabelecimento, recalcula o selo e devolve o plano', async () => {
    m.view.mockResolvedValue({ itemId: 'item-1', planType: 'trial' });
    const view = await activateListingTrialApplicationUseCase({ uid: 'owner-1' }, 'item-1');
    expect(m.trial).toHaveBeenCalledWith(
      { uid: 'owner-1' },
      { id: 'item-1', ownerId: 'owner-1' },
      'approved'
    );
    expect(m.updateItem).toHaveBeenCalled();
    expect(view).toMatchObject({ planType: 'trial' });
  });

  it('estabelecimento inexistente: NOT_FOUND', async () => {
    m.loadVerificationListing.mockResolvedValue(null);
    await expect(
      activateListingTrialApplicationUseCase({ uid: 'owner-1' }, 'item-x')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('job diário desliga selos vencidos e avisa quem vence em breve', async () => {
    m.compute.mockResolvedValue({ ...SEAL, isVerified: false });
    m.expired.mockResolvedValue([{ itemId: 'item-1' }]);
    m.expiring.mockResolvedValue([
      {
        itemId: 'item-2',
        ownerId: 'owner-1',
        planUntil: '2026-10-23T12:00:00.000Z',
        sealSuspended: false,
      },
      { itemId: 'item-4', ownerId: 'owner-1', planUntil: '2026-10-23', sealSuspended: true },
    ]);
    m.getItem.mockResolvedValue({ name: 'Pousada Sol' });
    m.notify.mockResolvedValue(true);

    const result = await runListingPlanMaintenanceApplicationUseCase(
      new Date('2026-10-21T12:00:00Z')
    );

    expect(m.setActive).toHaveBeenCalledWith('item-1', false);
    expect(m.notify).toHaveBeenCalledTimes(1);
    expect(m.notify.mock.calls[0]?.[0]).toMatchObject({
      id: 'plan_expiring_item-2_2d_2026-10-23',
      recipientPartnerId: 'owner-1',
    });
    expect(result).toEqual({ expired: 1, notified: 1 });
  });
});
