import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), profile: vi.fn() }));
vi.mock('../../../domain/bookings', () => ({ listSlotBookingsForOwnerUseCase: m.list }));
vi.mock('../../../domain/users', () => ({ getUserPublicProfileUseCase: m.profile }));

import { listSlotBookingsForPartnerApplicationUseCase } from './listSlotBookingsForPartnerApplicationUseCase';

describe('folha do horário no painel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('usa só o nome público do cliente e não devolve o resto da reserva', async () => {
    m.list.mockResolvedValue({
      offer: {
        id: 'o1',
        title: { 'pt-BR': 'Passeio' },
        kind: 'tour',
        meetingPoint: { address: 'Praça' },
      },
      slot: {
        id: 's1',
        startsAt: '2026-11-04T12:00:00.000Z',
        status: 'open',
        capacityTotal: 8,
        capacityReserved: 0,
        capacitySold: 4,
      },
      bookings: [
        {
          id: 'b1',
          buyerId: 'u1',
          participantsCount: 2,
          checkIns: [{ at: '2026-11-04T11:52:00.000Z' }],
          pickupAddress: 'Rua X',
          status: 'confirmed',
          totalMinor: 36000,
          offerSnapshot: { sellingUnit: 'person' },
        },
        {
          id: 'b2',
          buyerId: 'u2',
          participantsCount: 2,
          status: 'confirmed',
          totalMinor: 60000,
          offerSnapshot: { sellingUnit: 'group' },
        },
      ],
    });
    m.profile.mockImplementation(async (uid: string) =>
      uid === 'u1' ? { uid, displayName: 'Ana Souza', username: 'anasouza' } : null
    );
    const view = await listSlotBookingsForPartnerApplicationUseCase(
      { uid: 'owner', admin: false },
      'o1',
      's1'
    );
    expect(view.bookings).toEqual([
      {
        id: 'b1',
        buyerName: 'Ana Souza',
        buyerUsername: 'anasouza',
        units: 2,
        checkedInUnits: 1,
        checkedInAt: '2026-11-04T11:52:00.000Z',
        status: 'confirmed',
        totalMinor: 36000,
        sellingUnit: 'person',
      },
      {
        id: 'b2',
        buyerName: null,
        buyerUsername: null,
        units: 2,
        checkedInUnits: 0,
        checkedInAt: null,
        status: 'confirmed',
        totalMinor: 60000,
        sellingUnit: 'group',
      },
    ]);
    expect(JSON.stringify(view)).not.toContain('Rua X');
    expect(JSON.stringify(view)).not.toContain('u1');
  });
});
