import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  resolveOwner: vi.fn(),
  getProfile: vi.fn(),
  invite: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('../../../domain/users', () => ({
  resolveUsernameOwnerUseCase: m.resolveOwner,
  getUserProfileUseCase: m.getProfile,
}));
vi.mock('../../../domain/ticketing', () => ({ inviteCourtesyByUsernameUseCase: m.invite }));
vi.mock('../../../domain/notifications', () => ({ createNotificationUseCase: m.notify }));
vi.mock('../../../domain/events', () => ({
  getEventListingByIdUseCase: vi.fn(async () => ({
    title: 'Luau na Duna',
    establishmentId: 'it1',
  })),
  getEventOccurrenceByIdUseCase: vi.fn(async () => null),
}));
vi.mock('../partnerTermsGate', () => ({ assertActorPartnerTerms: vi.fn() }));
vi.mock('../../../domain/guide', () => ({
  getPublicGuideItemUseCase: vi.fn(async () => ({ name: 'Buggy do Preá' })),
}));

import { inviteCourtesyByUsernameApplicationUseCase } from './inviteCourtesyByUsernameApplicationUseCase';

const OWNER = {
  uid: 'bia',
  username: 'bia.reis',
  displayName: 'Bia Reis',
  photoURL: null,
  email: 'bia@example.com',
  emailVerified: true,
};

describe('cortesia pelo @ (D27)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.resolveOwner.mockResolvedValue(OWNER);
    m.getProfile.mockResolvedValue({ firstName: 'Beatriz', lastName: 'Reis' });
    m.notify.mockResolvedValue(undefined);
    m.invite.mockResolvedValue({
      id: 'c1',
      eventListingId: 'ev1',
      occurrenceId: 'oc1',
      channel: 'username',
      createdAt: '2026-12-10T12:00:00.000Z',
    });
  });

  it('usa nome e e-mail da conta e avisa a pessoa com o nome do estabelecimento', async () => {
    const row = await inviteCourtesyByUsernameApplicationUseCase(
      { uid: 'partner' },
      'oc1',
      'bia.reis'
    );
    expect(m.invite).toHaveBeenCalledWith({ uid: 'partner' }, 'oc1', {
      uid: 'bia',
      username: 'bia.reis',
      displayName: 'Bia Reis',
      holderName: 'Beatriz Reis',
      holderEmail: 'bia@example.com',
    });
    expect(m.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUid: 'bia',
        type: 'courtesy_received',
        params: { event: 'Luau na Duna', business: 'Buggy do Preá' },
      })
    );
    expect(row).toMatchObject({ status: 'in_wallet', guest: { username: 'bia.reis' } });
    expect(JSON.stringify(row)).not.toContain('bia@example.com');
  });

  it('conta sem e-mail confirmado não recebe', async () => {
    m.resolveOwner.mockResolvedValue({ ...OWNER, emailVerified: false });
    await expect(
      inviteCourtesyByUsernameApplicationUseCase({ uid: 'partner' }, 'oc1', 'bia.reis')
    ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_VERIFIED' });
    expect(m.invite).not.toHaveBeenCalled();
  });
});
