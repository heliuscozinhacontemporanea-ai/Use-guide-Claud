import type { OwnerSlotSummary } from '../../../domain/bookings';
import type { PartnerSessionInput } from './buildPartnerHome';
import type { PartnerTodayItem } from './partnerHomeTypes';

/** Linha da agenda (Hoje no Início e a Agenda) a partir de um horário de reserva. */
export function slotToAgendaItem(slot: OwnerSlotSummary): PartnerTodayItem {
  return {
    kind: 'slot',
    id: slot.slotId,
    parentId: slot.offerId,
    establishmentIds: [slot.guideItemId],
    title: slot.title['pt-BR'],
    offerKind: slot.kind,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt ?? null,
    sold: slot.unitsCount,
    capacity: slot.capacityTotal,
    checkedIn: slot.checkedInUnits,
    arrivedAt: slot.arrivedAt ?? null,
    bookings: slot.bookingsCount,
    waitingBookings: slot.waitingBookings,
    meetingPoint: slot.meetingPoint,
    serviceEndsAt: slot.serviceEndsAt,
  };
}

/** Linha da agenda a partir de uma sessão de evento. */
export function sessionToAgendaItem(session: PartnerSessionInput): PartnerTodayItem {
  return {
    kind: 'session',
    id: session.id,
    parentId: session.eventId,
    establishmentIds: session.establishmentId ? [session.establishmentId] : [],
    title: session.eventTitle,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    sold: session.sold,
    capacity: session.capacity,
    checkedIn: null,
    arrivedAt: null,
  };
}
