import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', () => ({ getPaymentReferenceUseCase: vi.fn() }));
vi.mock('../../../domain/ticketing', () => ({ hasCheckedInTicketForOrderUseCase: vi.fn() }));
vi.mock('../../../domain/bookings', () => ({ hasCheckedInBookingUseCase: vi.fn() }));

import { hasCheckedInBookingUseCase } from '../../../domain/bookings';
import { getPaymentReferenceUseCase } from '../../../domain/payment';
import { hasCheckedInTicketForOrderUseCase } from '../../../domain/ticketing';
import { disputeOutcomeApplicationUseCase } from './disputeOutcomeApplicationUseCase';

describe('disputeOutcomeApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ganha ou consulta sem estorno não pesa para ninguém', async () => {
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'won')).toBe('won');
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'warning_closed')).toBe('won');
    expect(getPaymentReferenceUseCase).not.toHaveBeenCalled();
  });

  it('reserva com check-in: a plataforma arca; sem check-in: o parceiro paga (D20)', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'booking',
      referenceId: 'bk_1',
    } as never);
    vi.mocked(hasCheckedInBookingUseCase).mockResolvedValueOnce(true);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_platform_absorbs');
    vi.mocked(hasCheckedInBookingUseCase).mockResolvedValueOnce(false);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_partner_pays');
    expect(hasCheckedInBookingUseCase).toHaveBeenCalledWith('bk_1');
  });

  it('ingresso continua decidido pelo check-in do ingresso', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
    } as never);
    vi.mocked(hasCheckedInTicketForOrderUseCase).mockResolvedValue(true);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_platform_absorbs');
    expect(hasCheckedInBookingUseCase).not.toHaveBeenCalled();
  });
});
