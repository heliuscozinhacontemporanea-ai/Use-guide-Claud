import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, Booking } from '../types/bookingTypes';
import type { FleetDay } from '../types/fleetTypes';
import { fleetSlotKey, freeUnits, peakUnits } from './fleetTime';

const MINUTE_MS = 60_000;

/** Fim do horário de serviço da reserva por veículo (o que a agenda, o código e o "Cheguei" usam). */
export function fleetServiceEndsAt(booking: Pick<Booking, 'offerSnapshot'>): string {
  const { startsAt, durationMinutes = 0 } = booking.offerSnapshot;
  return new Date(Date.parse(startsAt) + durationMinutes * MINUTE_MS).toISOString();
}

/**
 * Ocupa veículos do dia para a reserva (F3b): recusa se faltar veículo em algum momento do intervalo.
 * Reaproveita o horário de serviço do mesmo início e fim, se ainda estiver aberto; senão cria outro com
 * `newSlotId`. Devolve o dia e o horário como devem ficar.
 */
export function holdFleetBooking(params: {
  day: FleetDay | null;
  booking: Booking;
  existingSlot: AvailabilitySlot | null;
  newSlotId: string;
  now: string;
}): { day: FleetDay; slot: AvailabilitySlot } {
  const { day, booking, existingSlot, now } = params;
  const fleet = booking.fleet;
  if (!fleet) throw new BookingDomainError('VALIDATION_ERROR', 'Reserva sem dia de veículos.');
  if (!day || day.vehicles < 1) {
    throw new BookingDomainError('SLOT_UNAVAILABLE', 'Dia fechado para reservas.');
  }
  const units = booking.participantsCount;
  if (freeUnits(day, fleet.startsAt, fleet.endsAt) < units) {
    throw new BookingDomainError('INSUFFICIENT_CAPACITY', 'Sem veículo livre neste horário.');
  }
  const startsAt = booking.offerSnapshot.startsAt;
  const endsAt = fleetServiceEndsAt(booking);
  const reuse = existingSlot?.status === 'open' ? existingSlot : null;
  const slot: AvailabilitySlot = reuse
    ? {
        ...reuse,
        capacityTotal: day.vehicles,
        capacityReserved: reuse.capacityReserved + units,
        updatedAt: now,
      }
    : {
        id: params.newSlotId,
        offerId: booking.offerId,
        startsAt,
        endsAt,
        capacityTotal: day.vehicles,
        capacityReserved: units,
        capacitySold: 0,
        status: 'open',
        fleetDayId: day.id,
        createdAt: now,
        updatedAt: now,
      };
  return {
    slot,
    day: {
      ...day,
      holds: [
        ...day.holds,
        { bookingId: booking.id, startsAt: fleet.startsAt, endsAt: fleet.endsAt, units },
      ],
      slotIndex: { ...day.slotIndex, [fleetSlotKey(startsAt, endsAt)]: slot.id },
      updatedAt: now,
    },
  };
}

/** Pagamento depois da expiração: a reserva volta a valer só se o veículo ainda estiver livre. */
export function canHoldAgain(day: FleetDay | null, booking: Booking): boolean {
  const fleet = booking.fleet;
  if (!fleet || !day || day.vehicles < 1) return false;
  return freeUnits(day, fleet.startsAt, fleet.endsAt) >= booking.participantsCount;
}

/** Devolve ao dia os veículos de uma reserva (expirada ou cancelada). */
export function releaseFleetBooking(day: FleetDay, bookingId: string, now: string): FleetDay {
  return {
    ...day,
    holds: day.holds.filter((hold) => hold.bookingId !== bookingId),
    updatedAt: now,
  };
}

/** Veículos do dia: não baixa do maior número já reservado ao mesmo tempo. */
export function resizeFleetDay(day: FleetDay, vehicles: number, now: string): FleetDay {
  if (day.holds.length > 0) {
    const first = new Date(
      Math.min(...day.holds.map((hold) => Date.parse(hold.startsAt)))
    ).toISOString();
    const last = new Date(
      Math.max(...day.holds.map((hold) => Date.parse(hold.endsAt)))
    ).toISOString();
    if (vehicles < peakUnits(day.holds, first, last)) {
      throw new BookingDomainError(
        'VEHICLES_BELOW_BOOKED',
        'Este dia já tem mais veículos reservados do que esse número.'
      );
    }
  }
  return { ...day, vehicles, updatedAt: now };
}

/**
 * Remarcação de um horário por veículo: as reservas dele mudam de intervalo (e de dia, se a data mudar)
 * e só cabem se houver veículo livre na nova hora, sem contar elas mesmas.
 */
export function moveFleetHolds(params: {
  from: FleetDay;
  to: FleetDay;
  bookingIds: string[];
  shiftMs: number;
  oldKey: string;
  newKey: string;
  slotId: string;
  now: string;
}): { from: FleetDay; to: FleetDay } {
  const { from, to, shiftMs, now } = params;
  const ids = new Set(params.bookingIds);
  const shift = (iso: string) => new Date(Date.parse(iso) + shiftMs).toISOString();
  const moved = from.holds
    .filter((hold) => ids.has(hold.bookingId))
    .map((hold) => ({ ...hold, startsAt: shift(hold.startsAt), endsAt: shift(hold.endsAt) }));
  const sameDay = from.id === to.id;
  const target = sameDay
    ? { ...to, holds: to.holds.filter((hold) => !ids.has(hold.bookingId)) }
    : to;
  if (target.vehicles < 1) {
    throw new BookingDomainError('SLOT_UNAVAILABLE', 'Abra o novo dia antes de remarcar.');
  }
  for (const hold of moved) {
    if (freeUnits(target, hold.startsAt, hold.endsAt) < hold.units) {
      throw new BookingDomainError('INSUFFICIENT_CAPACITY', 'Sem veículo livre na nova hora.');
    }
  }
  const { [params.oldKey]: _old, ...fromIndex } = from.slotIndex;
  const nextTo: FleetDay = {
    ...target,
    holds: [...target.holds, ...moved],
    slotIndex: { ...(sameDay ? fromIndex : target.slotIndex), [params.newKey]: params.slotId },
    updatedAt: now,
  };
  if (sameDay) return { from: nextTo, to: nextTo };
  return {
    from: {
      ...from,
      holds: from.holds.filter((hold) => !ids.has(hold.bookingId)),
      slotIndex: fromIndex,
      updatedAt: now,
    },
    to: nextTo,
  };
}
