import { PLATFORM_TIME_ZONE, zonedDayKey } from '../../../shared/kernel/timeZones';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, Booking } from '../types/bookingTypes';
import type { FleetDay } from '../types/fleetTypes';
import { moveFleetHolds } from './fleetLedger';
import { fleetDayId, fleetSlotKey } from './fleetTime';

/** Dia aberto (ID) de um início na hora do lugar. */
export function fleetDayIdAt(offerId: string, startsAt: string, timeZone?: string): string {
  return fleetDayId(offerId, zonedDayKey(startsAt, timeZone ?? PLATFORM_TIME_ZONE));
}

/**
 * Remarcação de um horário por veículo (D16, 4A; F3b): o horário e as reservas ativas dele vão para a
 * nova hora, no mesmo dia ou em outro já aberto, só se houver veículo livre. Devolve o que gravar.
 */
export function rescheduleFleetHolds(params: {
  slot: AvailabilitySlot;
  bookings: Booking[];
  startsAt: string;
  timeZone?: string;
  days: (dayId: string) => FleetDay | null;
  now: string;
}): { slot: AvailabilitySlot; days: FleetDay[]; bookings: Booking[] } {
  const { slot, startsAt, now } = params;
  const from = slot.fleetDayId ? params.days(slot.fleetDayId) : null;
  if (!from) throw new BookingDomainError('NOT_FOUND', 'Dia do horário não encontrado.');
  const toId = fleetDayIdAt(slot.offerId, startsAt, params.timeZone);
  const to = toId === from.id ? from : params.days(toId);
  if (!to) throw new BookingDomainError('SLOT_UNAVAILABLE', 'Abra o novo dia antes de remarcar.');

  const shiftMs = Date.parse(startsAt) - Date.parse(slot.startsAt);
  const shift = (iso: string) => new Date(Date.parse(iso) + shiftMs).toISOString();
  const endsAt = shift(slot.endsAt ?? slot.startsAt);
  const newKey = fleetSlotKey(startsAt, endsAt);
  const taken = to.slotIndex[newKey];
  if (taken && taken !== slot.id) {
    throw new BookingDomainError('SLOT_UNAVAILABLE', 'Já existe um horário nessa hora.');
  }
  const moved = moveFleetHolds({
    from,
    to,
    bookingIds: params.bookings.map((booking) => booking.id),
    shiftMs,
    oldKey: fleetSlotKey(slot.startsAt, slot.endsAt ?? slot.startsAt),
    newKey,
    slotId: slot.id,
    now,
  });
  return {
    slot: { ...slot, startsAt, endsAt, fleetDayId: to.id, updatedAt: now },
    days: moved.from.id === moved.to.id ? [moved.to] : [moved.from, moved.to],
    bookings: params.bookings.map((booking) => ({
      ...booking,
      offerSnapshot: { ...booking.offerSnapshot, startsAt },
      ...(booking.fleet
        ? {
            fleet: {
              dayId: to.id,
              startsAt: shift(booking.fleet.startsAt),
              endsAt: shift(booking.fleet.endsAt),
            },
          }
        : {}),
    })),
  };
}
