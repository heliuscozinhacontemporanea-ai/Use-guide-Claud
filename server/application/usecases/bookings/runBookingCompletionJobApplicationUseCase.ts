import {
  type Booking,
  clearBookingDeadlineUseCase,
  completeFinishedBookingsUseCase,
  listBookingsWithDueDeadlineUseCase,
  resolveServiceConfirmationUseCase,
} from '../../../domain/bookings';
import {
  decideSaleClaimUseCase,
  openSaleClaimUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import { refundProviderAbsence, SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { bookingServiceWindow } from './bookingServiceWindow';
import { sendBookingServiceNotice } from './bookingServiceNotices';

export interface BookingCompletionJobResult {
  completed: number;
  askedToConfirm: number;
  deadlinesProcessed: number;
}

/** 72 h sem resposta a "O serviço aconteceu?": reembolso integral ao comprador (D20). */
async function refundUnconfirmedService(booking: Booking): Promise<void> {
  let claimId: string;
  try {
    const claim = await openSaleClaimUseCase({
      referenceType: 'booking',
      referenceId: booking.id,
      buyerUid: booking.buyerId,
      reason: 'did_not_happen',
      ...bookingServiceWindow(booking),
      allowAfterWindow: true,
    });
    claimId = claim.id;
  } catch (error) {
    // Já existe reclamação desta venda: o admin decide por ela, sem reembolso automático.
    if (error instanceof PaymentDomainError && error.code === 'CLAIM_ALREADY_EXISTS') {
      await resolveServiceConfirmationUseCase(booking.id, { resolution: 'admin' }, SYSTEM_ACTOR);
      return;
    }
    throw error;
  }
  await decideSaleClaimUseCase(claimId, SYSTEM_ACTOR, { outcome: 'refund_full' });
  await resolveServiceConfirmationUseCase(
    booking.id,
    { claimId, resolution: 'refunded' },
    SYSTEM_ACTOR
  );
  await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
  await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationExpiredPartner');
}

async function processDeadline(booking: Booking): Promise<void> {
  const absence = booking.providerAbsence;
  if (booking.deadline?.kind === 'provider_absence_response' && absence && !absence.resolution) {
    await refundProviderAbsence(booking, absence.claimId, SYSTEM_ACTOR);
    return;
  }
  const confirmation = booking.serviceConfirmation;
  if (
    booking.deadline?.kind === 'service_confirmation' &&
    confirmation &&
    !confirmation.resolution
  ) {
    await refundUnconfirmedService(booking);
    return;
  }
  await clearBookingDeadlineUseCase(booking.id, SYSTEM_ACTOR);
}

/**
 * Job de conclusão das reservas (D20): conclui as que terminaram, pergunta ao comprador quando falta a
 * prova do serviço e aplica os prazos vencidos. Uma reserva com erro não trava as demais.
 */
export async function runBookingCompletionJobApplicationUseCase(
  limit = 200
): Promise<BookingCompletionJobResult> {
  const { completed, askedToConfirm } = await completeFinishedBookingsUseCase(limit);
  for (const booking of askedToConfirm) {
    await sendBookingServiceNotice(booking.buyerId, 'confirmationAsked');
  }
  let deadlinesProcessed = 0;
  for (const booking of await listBookingsWithDueDeadlineUseCase(limit)) {
    try {
      await processDeadline(booking);
      deadlinesProcessed += 1;
    } catch (error) {
      console.error('[bookings.completionJob] prazo não processado', {
        bookingId: booking.id,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  return { completed, askedToConfirm: askedToConfirm.length, deadlinesProcessed };
}
