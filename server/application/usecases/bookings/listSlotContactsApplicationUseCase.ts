import { type BookingActor, listSlotContactsUseCase } from '../../../domain/bookings';
import { getUserPublicProfileUseCase } from '../../../domain/users';

/** Contato de quem ainda não chegou (p42): nome público, unidades, telefone e a resposta ao aviso. */
export interface SlotContactView {
  bookingId: string;
  buyerName: string | null;
  units: number;
  phone: string;
  response: { response: 'coming' | 'not_going'; at: string } | null;
  arrivedAt: string | null;
}

export async function listSlotContactsApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<SlotContactView[]> {
  const contacts = await listSlotContactsUseCase(actor, offerId, slotId);
  return Promise.all(
    contacts.map(async ({ booking, phone }) => ({
      bookingId: booking.id,
      buyerName:
        (await getUserPublicProfileUseCase(booking.buyerId).catch(() => null))?.displayName ?? null,
      units: booking.participantsCount,
      phone,
      response: booking.arrivalResponse ?? null,
      arrivedAt: booking.arrival?.at ?? null,
    }))
  );
}
