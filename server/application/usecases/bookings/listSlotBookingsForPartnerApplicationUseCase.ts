import { type BookingActor, listSlotBookingsForOwnerUseCase } from '../../../domain/bookings';
import { getUserPublicProfileUseCase } from '../../../domain/users';

/** Reserva na folha do horário (p06): nome público do cliente, unidades e quem chegou. */
export interface PartnerSlotBookingView {
  id: string;
  /** Nome do perfil público (o mesmo das avaliações); `null` quando o cliente não tem. */
  buyerName: string | null;
  /** @ público do cliente, sem o "@", para a mensagem pronta do WhatsApp (C2). */
  buyerUsername: string | null;
  units: number;
  checkedInUnits: number;
  /** Hora do primeiro check-in da reserva; `null` enquanto ninguém usou o código. */
  checkedInAt: string | null;
  /** Situação e valor pago, para a ficha da reserva no painel (print de 2026-11-10). */
  status: string;
  totalMinor: number;
  sellingUnit: 'person' | 'group';
}

export interface PartnerSlotDetailView {
  slot: {
    id: string;
    startsAt: string;
    endsAt: string | null;
    status: string;
    capacityTotal: number;
    capacityReserved: number;
    capacitySold: number;
    /** "Iniciar serviço" já tocado (C4). */
    startedAt: string | null;
  };
  offer: { id: string; title: string; kind: string; meetingPoint: string | null };
  bookings: PartnerSlotBookingView[];
}

export async function listSlotBookingsForPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<PartnerSlotDetailView> {
  const { offer, slot, bookings } = await listSlotBookingsForOwnerUseCase(actor, offerId, slotId);
  const buyers = [...new Set(bookings.map((booking) => booking.buyerId))];
  const profiles = new Map(
    await Promise.all(
      buyers.map(
        async (uid) => [uid, await getUserPublicProfileUseCase(uid).catch(() => null)] as const
      )
    )
  );
  return {
    slot: {
      id: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt ?? null,
      status: slot.status,
      capacityTotal: slot.capacityTotal,
      capacityReserved: slot.capacityReserved,
      capacitySold: slot.capacitySold,
      startedAt: slot.startedAt ?? null,
    },
    offer: {
      id: offer.id,
      title: offer.title['pt-BR'],
      kind: offer.kind,
      meetingPoint: offer.meetingPoint?.address ?? null,
    },
    bookings: bookings.map((booking) => ({
      id: booking.id,
      buyerName: profiles.get(booking.buyerId)?.displayName ?? null,
      buyerUsername: profiles.get(booking.buyerId)?.username ?? null,
      units: booking.participantsCount,
      checkedInUnits: booking.checkIns?.length ?? 0,
      checkedInAt: (booking.checkIns ?? []).map((checkIn) => checkIn.at).sort()[0] ?? null,
      status: booking.status,
      totalMinor: booking.totalMinor,
      sellingUnit: booking.offerSnapshot.sellingUnit === 'group' ? 'group' : 'person',
    })),
  };
}
