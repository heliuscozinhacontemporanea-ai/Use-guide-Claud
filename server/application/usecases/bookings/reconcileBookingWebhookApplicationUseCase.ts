import { recordPaidSalePayoutApplicationUseCase } from '../payouts/recordPaidSalePayoutApplicationUseCase';
import {
  BookingDomainError,
  bookingServiceEndsAt,
  requiresServiceProof,
  confirmBookingPaymentUseCase,
  getBookingUseCase,
  markBookingDisputedUseCase,
  markBookingPaymentFailedUseCase,
  markBookingRefundedUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  applyPayoutRefundUseCase,
  getPaymentReferenceUseCase,
  processProviderRefundUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../../domain/payment';

function readMetadata(obj: Record<string, unknown>): Record<string, string> {
  return (obj.metadata as Record<string, string> | undefined) ?? {};
}

async function handlePaymentSucceeded(
  paymentIntent: Record<string, unknown>,
  bookingId: string
): Promise<void> {
  const paymentIntentId = String(paymentIntent.id || '');
  await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');
  try {
    const booking = await confirmBookingPaymentUseCase(bookingId, paymentIntentId);
    await recordPaidSalePayoutApplicationUseCase(paymentIntent, {
      referenceType: 'booking',
      referenceId: booking.id,
      grossMinor: booking.totalMinor,
      serviceFeeMinor: 0,
      platformFeeMinor: booking.platformFeeMinor,
      title: booking.offerSnapshot.title,
      serviceEndsAt: bookingServiceEndsAt(booking),
      // D20: o repasse espera a prova de que o serviço aconteceu (check-in ou "sim" do comprador).
      ...(requiresServiceProof(booking.kind) ? { holdReasons: ['service_proof' as const] } : {}),
    });
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
      idempotencyKey: `refund_late_${bookingId}`,
      metadata: { referenceType: 'booking_refund', bookingId },
    });
  }
}

async function handleRefundUpdate(
  bookingId: string,
  refund: Record<string, unknown>
): Promise<void> {
  const providerStatus = String(refund.status || '');
  if (providerStatus === 'succeeded') {
    // Reserva sem taxa de serviço: o reembolso todo sai do valor do proprietário (D14).
    await applyPayoutRefundUseCase({
      referenceType: 'booking',
      referenceId: bookingId,
      refundKey: String(refund.id || ''),
      amountMinor: typeof refund.amount === 'number' ? refund.amount : 0,
      serviceFeeMinor: 0,
    });
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
      await handlePaymentSucceeded(obj, metadata.referenceId);
    } else {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');
      await markBookingPaymentFailedUseCase(metadata.referenceId);
    }
    return true;
  }

  if (event.type === 'refund.updated' || event.type === 'refund.created') {
    if (metadata.referenceType !== 'booking_refund' || !metadata.bookingId) return false;
    await handleRefundUpdate(metadata.bookingId, obj);
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
