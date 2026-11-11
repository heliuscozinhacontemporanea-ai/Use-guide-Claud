import { type BookingActor, listSlotContactsUseCase } from '../../../domain/bookings';
import { getUserPublicProfileUseCase } from '../../../domain/users';

/** Contato de quem ainda não chegou (p42): nome público, unidades, telefone e a resposta ao aviso. */
export interface SlotContactView {
  bookingId: string;
  buyerName: string | null;
  /** @ público do cliente, sem o "@", para a mensagem pronta do WhatsApp (C2). */
  buyerUsername: string | null;
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
    contacts.map(async ({ booking, phone }) => {
      const profile = await getUserPublicProfileUseCase(booking.buyerId).catch(() => null);
      return {
        bookingId: booking.id,
        buyerName: profile?.displayName ?? null,
        buyerUsername: profile?.username ?? null,
        units: booking.participantsCount,
        phone,
        response: booking.arrivalResponse ?? null,
        arrivedAt: booking.arrival?.at ?? null,
      };
    })
  );
}
