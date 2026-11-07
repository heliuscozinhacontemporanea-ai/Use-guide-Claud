import {
  BookingDomainError,
  type CreatePendingBookingInput,
  cancelPendingBookingUseCase,
  createPendingBookingUseCase,
} from '../../../domain/bookings';
import { assertListingCanSellUseCase } from '../../../domain/partners';
import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';
import {
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
} from '../../../shared/kernel/platformFees';
import { isPartnerSuspended } from '../isPartnerSuspended';

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

function loadFeeConfig() {
  try {
    return resolvePlatformFeeConfig();
  } catch (error) {
    if (error instanceof PlatformFeeConfigError) {
      // Sem taxa configurada a venda para (AGENTS.md §2.2.5); o nome da variável fica só no log.
      console.error('[bookings] taxas da plataforma não configuradas', { message: error.message });
      throw new BookingDomainError('SERVICE_UNAVAILABLE', 'Reservas indisponíveis no momento.');
    }
    throw error;
  }
}

/** Reserva as vagas e cria o pagamento na plataforma (D14). Quem confirma é o webhook. */
export async function createBookingApplicationUseCase(
  buyer: BookingBuyer,
  input: CreatePendingBookingInput
): Promise<CreateBookingResult> {
  // AGENTS.md §7.10 A07: e-mail verificado antes de comprar.
  if (!buyer.emailVerified) {
    throw new BookingDomainError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de reservar.');
  }
  const booking = await createPendingBookingUseCase(
    { uid: buyer.uid, admin: buyer.admin },
    input,
    loadFeeConfig()
  );

  try {
    if (await isPartnerSuspended(booking.sellerPartnerId)) {
      throw new BookingDomainError(
        'PARTNER_SUSPENDED',
        'Este parceiro não está aceitando reservas no momento.'
      );
    }
    // Rechecado na compra: a verificação pode ter sido revista depois de a oferta ser publicada.
    const { accountKey } = await assertListingCanSellUseCase(booking.guideItemId);
    const payment = await createMarketplacePaymentIntentUseCase({
      referenceType: 'booking',
      referenceId: booking.id,
      buyerId: buyer.uid,
      sellerPartnerId: booking.sellerPartnerId,
      sellerAccountKey: accountKey,
      description: `Use Guide — ${booking.offerSnapshot.title}`,
      serviceStartsAt: booking.offerSnapshot.startsAt,
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
