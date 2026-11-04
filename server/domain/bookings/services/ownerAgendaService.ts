import type { BookingsPort } from '../ports/bookingsPort';
import type {
  AvailabilitySlotStatus,
  BookableOfferKind,
  Booking,
  BookingActor,
  LocalizedText,
} from '../types/bookingTypes';

/** Um horário de oferta do dono, com o que já foi vendido e usado (painel do parceiro, D27). */
export interface OwnerSlotSummary {
  slotId: string;
  offerId: string;
  guideItemId: string;
  kind: BookableOfferKind;
  title: LocalizedText;
  startsAt: string;
  endsAt?: string;
  status: AvailabilitySlotStatus;
  capacityTotal: number;
  capacitySold: number;
  /** Reservas confirmadas ou concluídas. */
  bookingsCount: number;
  /** Pessoas ou grupos dessas reservas. */
  unitsCount: number;
  checkedInUnits: number;
  /** Primeiro "Cheguei" registrado no horário. */
  arrivedAt?: string;
}

/** "O prestador não veio" ainda sem resposta do prestador (D20): prazo de 2 h. */
export interface OwnerOpenAbsence {
  bookingId: string;
  offerId: string;
  guideItemId: string;
  title: LocalizedText;
  startsAt: string;
  respondBy: string;
}

const ACTIVE: readonly Booking['status'][] = ['confirmed', 'completed'];

export class OwnerAgendaService {
  constructor(private readonly port: BookingsPort) {}

  /** Horários do dono que começam em [fromIso, toIso), com as ausências relatadas ainda abertas. */
  async listOwnerAgenda(
    actor: BookingActor,
    fromIso: string,
    toIso: string
  ): Promise<{ slots: OwnerSlotSummary[]; openAbsences: OwnerOpenAbsence[] }> {
    const offers = await this.port.listOffersByOwner(actor.uid);
    const slots: OwnerSlotSummary[] = [];
    const openAbsences: OwnerOpenAbsence[] = [];
    for (const offer of offers) {
      const offerSlots = await this.port.listSlots(offer.id, fromIso, toIso);
      for (const slot of offerSlots) {
        if (slot.status === 'canceled') continue;
        const bookings = await this.port.listBookingsBySlot(slot.id);
        const active = bookings.filter((booking) => ACTIVE.includes(booking.status));
        const arrivals = bookings
          .map((booking) => booking.arrival?.at)
          .filter((at): at is string => Boolean(at))
          .sort();
        slots.push({
          slotId: slot.id,
          offerId: offer.id,
          guideItemId: offer.guideItemId,
          kind: offer.kind,
          title: offer.title,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          status: slot.status,
          capacityTotal: slot.capacityTotal,
          capacitySold: slot.capacitySold,
          bookingsCount: active.length,
          unitsCount: active.reduce((sum, booking) => sum + booking.participantsCount, 0),
          checkedInUnits: active.reduce((sum, booking) => sum + (booking.checkIns?.length ?? 0), 0),
          arrivedAt: arrivals[0],
        });
        for (const booking of bookings) {
          const absence = booking.providerAbsence;
          if (absence && !absence.answer && !absence.resolution) {
            openAbsences.push({
              bookingId: booking.id,
              offerId: offer.id,
              guideItemId: offer.guideItemId,
              title: offer.title,
              startsAt: slot.startsAt,
              respondBy: absence.respondBy,
            });
          }
        }
      }
    }
    slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    openAbsences.sort((a, b) => a.respondBy.localeCompare(b.respondBy));
    return { slots, openAbsences };
  }
}
