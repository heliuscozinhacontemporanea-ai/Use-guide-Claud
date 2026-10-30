import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => ({
  bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
    .bookingServiceEndsAt,
  checkInBookingByCodeUseCase: vi.fn(),
  clearBookingDeadlineUseCase: vi.fn(),
  completeFinishedBookingsUseCase: vi.fn(),
  eraseExpiredPickupAddressesUseCase: vi.fn().mockResolvedValue(0),
  getBookingForAbsenceReportUseCase: vi.fn(),
  getOpenProviderAbsenceUseCase: vi.fn(),
  getPendingServiceConfirmationUseCase: vi.fn(),
  listBookingsWithDueDeadlineUseCase: vi.fn(),
  recordProviderAbsenceUseCase: vi.fn(),
  resolveProviderAbsenceUseCase: vi.fn(),
  resolveServiceConfirmationUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    decideSaleClaimUseCase: vi.fn(),
    openSaleClaimUseCase: vi.fn(),
    releasePayoutHoldUseCase: vi.fn(),
  };
});
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));
vi.mock('../payouts/decideSaleClaimApplicationUseCase', () => ({
  decideSaleClaimApplicationUseCase: vi.fn(),
}));

import {
  checkInBookingByCodeUseCase,
  completeFinishedBookingsUseCase,
  getBookingForAbsenceReportUseCase,
  getOpenProviderAbsenceUseCase,
  getPendingServiceConfirmationUseCase,
  listBookingsWithDueDeadlineUseCase,
  recordProviderAbsenceUseCase,
  resolveProviderAbsenceUseCase,
  resolveServiceConfirmationUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  decideSaleClaimUseCase,
  openSaleClaimUseCase,
  PaymentDomainError,
  releasePayoutHoldUseCase,
} from '../../../domain/payment';
import { decideSaleClaimApplicationUseCase } from '../payouts/decideSaleClaimApplicationUseCase';
import { answerProviderAbsenceApplicationUseCase } from './answerProviderAbsenceApplicationUseCase';
import { answerServiceConfirmationApplicationUseCase } from './answerServiceConfirmationApplicationUseCase';
import { checkInBookingApplicationUseCase } from './checkInBookingApplicationUseCase';
import { reportProviderAbsentApplicationUseCase } from './reportProviderAbsentApplicationUseCase';
import { runBookingCompletionJobApplicationUseCase } from './runBookingCompletionJobApplicationUseCase';

const BUYER = { uid: 'buyer-1', admin: false };
const PARTNER = { uid: 'partner-1', admin: false };
const BOOKING = {
  id: 'bk_1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'partner-1',
  offerSnapshot: { startsAt: '2026-11-10T11:00:00.000Z', durationMinutes: 120 },
};
const ABSENCE = { reportedAt: 't', respondBy: 't2', claimId: 'claim_booking_bk_1' };

function notified(recipient: string, title: string) {
  return expect.objectContaining({ recipientPartnerId: recipient, title });
}

describe('prova do serviço na camada application (D20)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveProviderAbsenceUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(resolveServiceConfirmationUseCase).mockResolvedValue(BOOKING as never);
  });

  it('"O prestador não veio" abre a reclamação, grava o relato e avisa o prestador', async () => {
    vi.mocked(getBookingForAbsenceReportUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    vi.mocked(recordProviderAbsenceUseCase).mockResolvedValue(BOOKING as never);
    await reportProviderAbsentApplicationUseCase(BUYER, 'bk_1');
    expect(openSaleClaimUseCase).toHaveBeenCalledWith({
      referenceType: 'booking',
      referenceId: 'bk_1',
      buyerUid: 'buyer-1',
      reason: 'did_not_happen',
      serviceStartsAt: '2026-11-10T11:00:00.000Z',
      serviceEndsAt: '2026-11-10T13:00:00.000Z',
    });
    expect(recordProviderAbsenceUseCase).toHaveBeenCalledWith(BUYER, 'bk_1', 'claim_booking_bk_1');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('partner-1', 'O cliente diz que você não compareceu')
    );
  });

  it('prestador admite: reembolso integral com multa antes de gravar o desfecho', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    await answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'admitted');
    expect(decideSaleClaimApplicationUseCase).toHaveBeenCalledWith('system', 'claim_booking_bk_1', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { resolution: 'refunded', answer: 'admitted' },
      'partner-1'
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('buyer-1', 'Reembolso a caminho')
    );
  });

  it('se o reembolso falhar, o desfecho não é gravado (o job tenta de novo)', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    vi.mocked(decideSaleClaimApplicationUseCase).mockRejectedValueOnce(new Error('stripe'));
    await expect(
      answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'admitted')
    ).rejects.toThrow('stripe');
    expect(resolveProviderAbsenceUseCase).not.toHaveBeenCalled();
  });

  it('prestador diz que foi: a reclamação fica com o admin, sem reembolso', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    await answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'was_there');
    expect(decideSaleClaimApplicationUseCase).not.toHaveBeenCalled();
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'was_there', resolution: 'admin' },
      'partner-1'
    );
  });

  it('check-in depois do relato encerra a reclamação sem reembolso', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
      booking: { ...BOOKING, providerAbsence: ABSENCE },
      unit: 0,
      name: null,
      alreadyCheckedIn: false,
      checkedInAt: 't',
    } as never);
    await checkInBookingApplicationUseCase(PARTNER, {
      offerId: 'offer-1',
      slotId: 'slot-1',
      code: 'K7M4QX',
    });
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
      outcome: 'release',
    });
    // O check-in é a prova do serviço: o repasse deixa de esperar (D20).
    expect(releasePayoutHoldUseCase).toHaveBeenCalledWith('booking', 'bk_1', 'service_proof');
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { resolution: 'withdrawn' },
      'partner-1'
    );
  });

  it('comprador responde sim: confirmado, sem reclamação', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue(BOOKING as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'yes');
    expect(openSaleClaimUseCase).not.toHaveBeenCalled();
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'yes', resolution: 'confirmed' },
      'buyer-1'
    );
    expect(releasePayoutHoldUseCase).toHaveBeenCalledWith('booking', 'bk_1', 'service_proof');
  });

  it('comprador responde não depois de "Cliente sem código": reclamação vai ao admin', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue({
      ...BOOKING,
      serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_code' },
    } as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'no');
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'did_not_happen', allowAfterWindow: true })
    );
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'no', claimId: 'claim_booking_bk_1', resolution: 'admin' },
      'buyer-1'
    );
    expect(decideSaleClaimUseCase).not.toHaveBeenCalled();
  });

  it('comprador responde não sem nenhum registro do serviço: reembolso integral na hora', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue({
      ...BOOKING,
      serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_record' },
    } as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'no');
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
      outcome: 'refund_full',
    });
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'no', claimId: 'claim_booking_bk_1', resolution: 'refunded' },
      'buyer-1'
    );
  });

  it('job: pergunta aos compradores, reembolsa ausência sem resposta e confirmação vencida', async () => {
    vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
      completed: 2,
      askedToConfirm: [BOOKING as never],
    });
    vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
      {
        ...BOOKING,
        id: 'bk_absence',
        providerAbsence: { ...ABSENCE, claimId: 'claim_absence' },
        deadline: { kind: 'provider_absence_response', at: 't2' },
      },
      {
        ...BOOKING,
        id: 'bk_unconfirmed',
        serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_record' },
        deadline: { kind: 'service_confirmation', at: 't2' },
      },
    ] as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_unconfirmed' } as never);
    const result = await runBookingCompletionJobApplicationUseCase(200);
    expect(result).toEqual({
      completed: 2,
      askedToConfirm: 1,
      deadlinesProcessed: 2,
      pickupAddressesErased: 0,
    });
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('buyer-1', 'O serviço aconteceu?')
    );
    expect(decideSaleClaimApplicationUseCase).toHaveBeenCalledWith('system', 'claim_absence', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    // Confirmação vencida: reembolso integral sem multa (o prestador pode só ter esquecido o código).
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_unconfirmed', 'system', {
      outcome: 'refund_full',
    });
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_unconfirmed',
      { claimId: 'claim_unconfirmed', resolution: 'refunded' },
      'system'
    );
  });

  it('job: reclamação já aberta leva a confirmação vencida ao admin, e um erro não trava as demais', async () => {
    vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
      completed: 0,
      askedToConfirm: [],
    });
    vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
      {
        ...BOOKING,
        id: 'bk_error',
        providerAbsence: { ...ABSENCE, claimId: 'claim_error' },
        deadline: { kind: 'provider_absence_response', at: 't2' },
      },
      {
        ...BOOKING,
        id: 'bk_claimed',
        serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_code' },
        deadline: { kind: 'service_confirmation', at: 't2' },
      },
    ] as never);
    vi.mocked(decideSaleClaimApplicationUseCase).mockRejectedValueOnce(new Error('stripe'));
    vi.mocked(openSaleClaimUseCase).mockRejectedValueOnce(
      new PaymentDomainError('CLAIM_ALREADY_EXISTS', 'Já existe.', 409)
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await runBookingCompletionJobApplicationUseCase(200);
    expect(result.deadlinesProcessed).toBe(1);
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_claimed',
      { resolution: 'admin' },
      'system'
    );
    expect(errors).toHaveBeenCalledWith(
      '[bookings.completionJob] prazo não processado',
      expect.objectContaining({ bookingId: 'bk_error' })
    );
    errors.mockRestore();
  });
});
