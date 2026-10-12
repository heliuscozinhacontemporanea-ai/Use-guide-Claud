import {
  BookingDomainError,
  confirmBookingPaymentUseCase,
  getBookingUseCase,
  markBookingDisputedUseCase,
  markBookingPaymentFailedUseCase,
  markBookingRefundedUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  getPaymentReferenceUseCase,
  processProviderRefundUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../../domain/payment';

function readMetadata(obj: Record<string, unknown>): Record<string, string> {
  return (obj.metadata as Record<string, string> | undefined) ?? {};
}

async function handlePaymentSucceeded(paymentIntentId: string, bookingId: string): Promise<void> {
  await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');
  try {
    const booking = await confirmBookingPaymentUseCase(bookingId, paymentIntentId);
    await createNotificationUseCase({
      recipientPartnerId: booking.sellerPartnerId,
      type: 'admin_message',
      title: 'Nova reserva confirmada',
      message: `${booking.offerSnapshot.title} — ${booking.participantsCount} participante(s).`,
    }).catch(() => undefined);
  } catch (error) {
    if (!(error instanceof BookingDomainError) || error.code !== 'LATE_PAYMENT_REJECTED') {
      throw error;
    }
    // Pagamento chegou para uma reserva expirada sem vaga ou já cancelada: devolve tudo.
    await processProviderRefundUseCase({
      paymentIntentId,
      reverseTransfer: true,
      refundApplicationFee: true,
      idempotencyKey: `refund_late_${bookingId}`,
      metadata: { referenceType: 'booking_refund', bookingId },
    });
  }
}

async function handleRefundUpdate(bookingId: string, providerStatus: string): Promise<void> {
  if (providerStatus === 'succeeded') {
    const booking = await getBookingUseCase(bookingId);
    // Só a reserva cancelada vira "reembolsada"; o reembolso de pagamento tardio não muda o status.
    if (booking?.status === 'canceled') {
      await markBookingRefundedUseCase(bookingId);
    }
    return;
  }
  if (providerStatus === 'failed' || providerStatus === 'canceled') {
    // TODO: notificar admin quando notifications tiver destinatário admin (débito B13).
    console.error('[reconcileBookingWebhook] refund failed', { bookingId, providerStatus });
  }
  // 'pending' e 'requires_action' não são reembolso aprovado (AGENTS.md §8.6 item 6).
}

/** Trata os eventos do Stripe de reservas. Devolve false quando o evento não é de reserva. */
export async function reconcileBookingWebhookApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<boolean> {
  const obj = event.dataObject || {};
  const metadata = readMetadata(obj);

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    if (metadata.referenceType !== 'booking' || !metadata.referenceId) return false;
    const paymentIntentId = String(obj.id || '');
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSucceeded(paymentIntentId, metadata.referenceId);
    } else {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');
      await markBookingPaymentFailedUseCase(metadata.referenceId);
    }
    return true;
  }

  if (event.type === 'refund.updated' || event.type === 'refund.created') {
    if (metadata.referenceType !== 'booking_refund' || !metadata.bookingId) return false;
    await handleRefundUpdate(metadata.bookingId, String(obj.status || ''));
    return true;
  }

  if (event.type === 'charge.dispute.created') {
    const paymentIntentId = String(obj.payment_intent || '');
    // O objeto Dispute não traz a metadata do pagamento; a referência vem da transação gravada.
    const reference = paymentIntentId ? await getPaymentReferenceUseCase(paymentIntentId) : null;
    if (reference?.referenceType !== 'booking') return false;
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'disputed');
    await markBookingDisputedUseCase(reference.referenceId).catch((error: unknown) => {
      if (!(error instanceof BookingDomainError)) throw error;
    });
    return true;
  }

  return false;
}
