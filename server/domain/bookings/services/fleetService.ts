import { PLATFORM_TIME_ZONE, zonedDayKey } from '../../../shared/kernel/timeZones';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort, FleetDayChange } from '../ports/bookingsPort';
import { type BookableOffer, type BookingActor, isFleetOffer } from '../types/bookingTypes';
import type { FleetBusy, FleetCustom, FleetDay } from '../types/fleetTypes';
import { fleetOccupancy } from '../utils/fleetBookingRequest';
import {
  datesBetween,
  fleetDayId,
  freeUnits,
  minutesOfDay,
  placeMinuteIso,
  weekdayOf,
} from '../utils/fleetTime';
import { getOwnedOffer } from '../utils/ownedOffer';

// Um pedido abre no máximo ~4 meses de dias (a lista do parceiro lê até 120).
const MAX_DAYS_PER_REQUEST = 120;

export interface OpenFleetDaysInput {
  startDate: string;
  endDate: string;
  weekdays: number[];
  /** 0 fecha os dias para novas reservas. */
  vehicles: number;
}

/** Dia visto pelo parceiro: veículos e ocupação, sem quem reservou. */
export interface PartnerFleetDay {
  date: string;
  vehicles: number;
  opensAt?: string;
  closesAt?: string;
  busy: FleetBusy[];
}

/** Dia visto pelo comprador (F3b): o que dá para reservar e o que já está ocupado, sem as reservas. */
export interface PublicFleetDay {
  date: string;
  vehicles: number;
  opensAt?: string;
  closesAt?: string;
  busy: FleetBusy[];
  fixed: Array<{ id: string; startsAt: string; endsAt: string; available: number }>;
  custom?: FleetCustom & { earliestStartsAt: string };
}

function busyOf(day: FleetDay): FleetBusy[] {
  return day.holds.map(({ startsAt, endsAt, units }) => ({ startsAt, endsAt, units }));
}

function timeZoneOf(offer: BookableOffer): string {
  return offer.timeZone ?? PLATFORM_TIME_ZONE;
}

/** Dias abertos das ofertas por veículo (aluguel e translado privativo, F3b). */
export class FleetService {
  constructor(
    private readonly port: BookingsPort,
    private readonly items: BookableItemLookupPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  /**
   * Abre (ou muda) os dias com o número de veículos. No aluguel, o horário de cada dia é o de
   * funcionamento do anúncio, e dia fechado no anúncio não abre.
   */
  async openDays(
    actor: BookingActor,
    offerId: string,
    input: OpenFleetDaysInput
  ): Promise<PartnerFleetDay[]> {
    const offer = await this.fleetOfferOf(actor, offerId);
    const timeZone = timeZoneOf(offer);
    const today = zonedDayKey(this.now().toISOString(), timeZone);
    const dates = datesBetween(
      input.startDate,
      input.endDate,
      input.weekdays,
      MAX_DAYS_PER_REQUEST
    ).filter((date) => date >= today);
    const hours =
      offer.kind === 'rental'
        ? (await this.items.getItem(offer.guideItemId))?.openingHours
        : undefined;
    const changes: FleetDayChange[] = [];
    for (const date of dates) {
      const change: FleetDayChange = {
        id: fleetDayId(offer.id, date),
        offerId: offer.id,
        date,
        vehicles: input.vehicles,
      };
      if (offer.kind === 'rental') {
        const window = hours?.[weekdayOf(date)];
        const open = window ? minutesOfDay(window.open) : null;
        const close = window ? minutesOfDay(window.close) : null;
        if (open === null || close === null || close <= open) continue;
        change.opensAt = placeMinuteIso(date, open, timeZone);
        change.closesAt = placeMinuteIso(date, close, timeZone);
      }
      changes.push(change);
    }
    const saved = await this.port.saveFleetDays(changes);
    return saved.map((day) => this.partnerView(day));
  }

  async listDays(
    actor: BookingActor,
    offerId: string,
    fromDate: string,
    toDate: string
  ): Promise<PartnerFleetDay[]> {
    const offer = await this.fleetOfferOf(actor, offerId);
    const days = await this.port.listFleetDays(offer.id, fromDate, toDate);
    return days.map((day) => this.partnerView(day));
  }

  /** O que o comprador pode reservar num dia: períodos ou saídas com veículos livres e o personalizado. */
  async publicDay(offerId: string, date: string): Promise<PublicFleetDay> {
    const offer = await this.port.getOffer(offerId);
    if (offer?.status !== 'published' || !isFleetOffer(offer) || !offer.fleet) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const day = await this.port.getFleetDay(fleetDayId(offer.id, date));
    const nowMs = this.now().getTime();
    const base = { date, vehicles: day?.vehicles ?? 0, busy: day ? busyOf(day) : [] };
    if (!day || day.vehicles < 1) return { ...base, fixed: [] };
    const timeZone = timeZoneOf(offer);
    const fixed = offer.fleet.fixed.flatMap((period) => {
      const occupancy = fleetOccupancy(
        offer,
        date,
        minutesOfDay(period.start) ?? -1,
        period.minutes,
        timeZone
      );
      if (!occupancy || Date.parse(occupancy.serviceStartsAt) <= nowMs) return [];
      return [
        {
          id: period.id,
          startsAt: occupancy.serviceStartsAt,
          endsAt: occupancy.serviceEndsAt,
          available: freeUnits(day, occupancy.serviceStartsAt, occupancy.occupiedUntil),
        },
      ];
    });
    const custom = offer.fleet.custom;
    const notice = custom?.mode === 'time' ? custom.minNoticeHours * 3_600_000 : 0;
    return {
      ...base,
      ...(day.opensAt ? { opensAt: day.opensAt } : {}),
      ...(day.closesAt ? { closesAt: day.closesAt } : {}),
      fixed,
      ...(custom
        ? { custom: { ...custom, earliestStartsAt: new Date(nowMs + notice).toISOString() } }
        : {}),
    };
  }

  private partnerView(day: FleetDay): PartnerFleetDay {
    return {
      date: day.date,
      vehicles: day.vehicles,
      ...(day.opensAt ? { opensAt: day.opensAt } : {}),
      ...(day.closesAt ? { closesAt: day.closesAt } : {}),
      busy: busyOf(day),
    };
  }

  private async fleetOfferOf(actor: BookingActor, offerId: string): Promise<BookableOffer> {
    const offer = await getOwnedOffer(this.port, actor, offerId);
    if (!isFleetOffer(offer)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Esta oferta vende por horários com vagas.');
    }
    if (offer.status === 'archived') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não recebe dias.');
    }
    return offer;
  }
}
