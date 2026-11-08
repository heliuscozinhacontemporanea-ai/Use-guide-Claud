import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', () => ({ listPendingSaleClaimsUseCase: vi.fn() }));
vi.mock('../../../domain/bookings', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../paymentAccounts/describeSellerAccountsApplicationUseCase', () => ({
  describeSellerAccountsApplicationUseCase: vi.fn().mockResolvedValue({}),
}));

import { getBookingUseCase } from '../../../domain/bookings';
import { listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { listAdminSaleClaimsApplicationUseCase } from './listAdminSaleClaimsApplicationUseCase';

describe('listAdminSaleClaimsApplicationUseCase (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reclamação de reserva traz as provas do serviço; a de ingresso não busca reserva', async () => {
    vi.mocked(listPendingSaleClaimsUseCase).mockResolvedValue({
      data: [
        { id: 'c1', referenceType: 'booking', referenceId: 'bk_1' },
        { id: 'c2', referenceType: 'ticket_order', referenceId: 'ord_1' },
      ],
      nextCursor: null,
    } as never);
    vi.mocked(getBookingUseCase).mockResolvedValue({
      id: 'bk_1',
      status: 'confirmed',
      participantsCount: 4,
      pickupAddress: 'Pousada Vila Jeri',
      offerSnapshot: { startsAt: '2026-11-10T11:00:00.000Z' },
      arrival: {
        at: '2026-11-10T11:02:00.000Z',
        byUid: 'p',
        location: { lat: -2.79, lng: -40.51 },
      },
      providerAbsence: {
        reportedAt: '2026-11-10T11:31:00.000Z',
        respondBy: 't',
        claimId: 'c1',
        answer: 'was_there',
        answeredAt: '2026-11-10T11:40:00.000Z',
      },
    } as never);
    const result = await listAdminSaleClaimsApplicationUseCase(20);
    expect(getBookingUseCase).toHaveBeenCalledTimes(1);
    expect(result.data[0]?.serviceEvidence).toEqual({
      startsAt: '2026-11-10T11:00:00.000Z',
      pickupAddress: 'Pousada Vila Jeri',
      checkIn: null,
      arrival: { at: '2026-11-10T11:02:00.000Z', location: { lat: -2.79, lng: -40.51 } },
      providerAbsence: {
        reportedAt: '2026-11-10T11:31:00.000Z',
        answer: 'was_there',
        answeredAt: '2026-11-10T11:40:00.000Z',
      },
      serviceConfirmation: null,
      noShow: false,
    });
    // Sem o ID de quem fez o "Cheguei": a allowlist só leva hora e local.
    expect(JSON.stringify(result.data[0])).not.toContain('byUid');
    expect(result.data[1]?.serviceEvidence).toBeUndefined();
  });
});
