import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  offers: vi.fn(),
  items: vi.fn(),
  invite: vi.fn(),
  listing: vi.fn(),
  notify: vi.fn(),
}));
vi.mock('../../../domain/bookings', () => ({ listPartnerOffersUseCase: m.offers }));
vi.mock('../../../domain/guide', () => ({
  listOwnerGuideItemsUseCase: m.items,
  getPublicGuideItemUseCase: vi.fn(async () => null),
}));
vi.mock('../../../domain/events', () => ({ getEventListingByIdUseCase: m.listing }));
vi.mock('../../../domain/notifications', () => ({ createNotificationUseCase: m.notify }));
vi.mock('../../../domain/users', () => ({
  resolveUsernameOwnerUseCase: vi.fn(async () => ({
    uid: 'ana',
    username: 'ana.souza',
    displayName: 'Ana',
  })),
}));
vi.mock('../../../domain/gateStaff', async () => {
  const { GateStaffError } = await import('../../../domain/gateStaff/errors/gateStaffError');
  return { GateStaffError, inviteGateStaffUseCase: m.invite };
});

import { inviteGateStaffApplicationUseCase } from './inviteGateStaffApplicationUseCase';

describe('convite para a portaria (C1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.offers.mockResolvedValue([
      { kind: 'private_entry', status: 'published', guideItemId: 'lagoa' },
      { kind: 'tour', status: 'published', guideItemId: 'buggy' },
    ]);
    m.items.mockResolvedValue([
      { id: 'lagoa', name: 'Lagoa Azul' },
      { id: 'buggy', name: 'Buggy' },
    ]);
    m.invite.mockResolvedValue({ id: 'm1' });
    m.notify.mockResolvedValue(undefined);
  });

  it('atração do dono com entrada: convida e avisa a pessoa', async () => {
    const result = await inviteGateStaffApplicationUseCase(
      'dono',
      { type: 'place', id: 'lagoa' },
      'ana.souza'
    );
    expect(result).toEqual({ id: 'm1' });
    expect(m.invite).toHaveBeenCalledWith(
      'dono',
      { type: 'place', id: 'lagoa' },
      expect.objectContaining({ uid: 'ana' })
    );
    expect(m.notify).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'ana', type: 'gate_staff_invited' })
    );
  });

  it('lugar sem entrada, de outro dono, ou evento de outro dono: como inexistente (IDOR)', async () => {
    const notFound = { code: 'GATE_STAFF_NOT_FOUND' };
    await expect(
      inviteGateStaffApplicationUseCase('dono', { type: 'place', id: 'buggy' }, 'ana.souza')
    ).rejects.toMatchObject(notFound);
    await expect(
      inviteGateStaffApplicationUseCase('dono', { type: 'place', id: 'alheio' }, 'ana.souza')
    ).rejects.toMatchObject(notFound);
    m.listing.mockResolvedValue({ id: 'ev1', ownerId: 'outro' });
    await expect(
      inviteGateStaffApplicationUseCase('dono', { type: 'event', id: 'ev1' }, 'ana.souza')
    ).rejects.toMatchObject(notFound);
    expect(m.invite).not.toHaveBeenCalled();
  });
});
