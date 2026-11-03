import { expireOverdueBookingsUseCase } from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';

/** Reserva não paga no prazo libera a vaga e avisa o comprador que chegou ao pagamento (D25). */
export async function expireUnpaidBookingsApplicationUseCase(limit = 200): Promise<number> {
  const expired = await expireOverdueBookingsUseCase(limit);
  for (const booking of expired) {
    if (!booking.paymentIntentId) continue;
    await createNotificationUseCase({
      recipientUid: booking.buyerId,
      type: 'purchase_expired',
      params: { offer: booking.offerSnapshot.title },
      link: { screen: 'purchases' },
      dedupeKey: `purchase_expired_${booking.id}`,
    }).catch(() => undefined);
  }
  return expired.length;
}
