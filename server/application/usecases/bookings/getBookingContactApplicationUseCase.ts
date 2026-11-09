import { type BookingActor, openBookingContactUseCase } from '../../../domain/bookings';
import { getGuideItemContactUseCase } from '../../../domain/guide';

export interface BookingContactView {
  counterpart: 'partner' | 'buyer';
  /** E.164; `null` quando o outro lado não deixou telefone. */
  phone: string | null;
}

/**
 * Contato depois da compra (C2/B37): o comprador recebe o telefone do parceiro (que o anúncio que
 * vende pelo app não publica) e o parceiro, o do comprador. A regra de quem e quando é do `bookings`.
 */
export async function getBookingContactApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<BookingContactView> {
  const target = await openBookingContactUseCase(actor, bookingId);
  if (target.counterpart === 'buyer') return target;
  const contact = await getGuideItemContactUseCase(target.guideItemId);
  return { counterpart: 'partner', phone: contact?.phone ?? null };
}
