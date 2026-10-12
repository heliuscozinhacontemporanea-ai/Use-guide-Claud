import {
  BookingDomainError,
  type CreatePendingBookingInput,
  cancelPendingBookingUseCase,
  createPendingBookingUseCase,
} from '../../../domain/bookings';
import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';

export interface BookingBuyer {
  uid: string;
  admin: boolean;
  emailVerified: boolean;
}

export interface CreateBookingResult {
  bookingId: string;
  status: string;
  clientSecret: string;
  totalMinor: number;
  expiresAt: string | null;
}

/** Reserva as vagas e cria o pagamento (destination charge). Quem confirma é o webhook. */
export async function createBookingApplicationUseCase(
  buyer: BookingBuyer,
  input: CreatePendingBookingInput
): Promise<CreateBookingResult> {
  // AGENTS.md §7.10 A07: e-mail verificado antes de comprar.
  if (!buyer.emailVerified) {
    throw new BookingDomainError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de reservar.');
  }
  const platformFeePercent = Number(process.env.USE_GUIDE_PLATFORM_FEE_PERCENT ?? 10);
  const booking = await createPendingBookingUseCase(
    { uid: buyer.uid, admin: buyer.admin },
    input,
    platformFeePercent
  );

  try {
    const payment = await createMarketplacePaymentIntentUseCase({
      referenceType: 'booking',
      referenceId: booking.id,
      buyerId: buyer.uid,
      sellerPartnerId: booking.sellerPartnerId,
      description: `Use Guide — ${booking.offerSnapshot.title}`,
      totalMinor: booking.totalMinor,
      platformFeeMinor: booking.platformFeeMinor,
      idempotencyKey: `pi_booking_${booking.id}`,
    });
    return {
      bookingId: booking.id,
      status: booking.status,
      clientSecret: payment.clientSecret,
      totalMinor: booking.totalMinor,
      expiresAt: booking.expiresAt,
    };
  } catch (error) {
    // Sem pagamento criado, a vaga não pode ficar presa por 15 minutos.
    if (booking.status === 'pending_payment') {
      await cancelPendingBookingUseCase(booking.id, 'payment_init_failed').catch(() => undefined);
    }
    throw error;
  }
}
