import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingCheckIn,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';
import {
  deriveCheckInCode,
  matchCheckInCodeUnit,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  CHECK_IN_MAX_FAILURES,
  checkInCodeVisibleFromMs,
  checkInWindow,
  resolveCheckInTime,
} from '../utils/checkInWindow';
import { checkInsOf, hasServiceProof } from '../utils/serviceProof';

/** Código de uma unidade: a pessoa (venda por pessoa) ou o grupo. */
export interface UnitCode {
  unit: number;
  /** null fora do dia do serviço ou depois do check-in desta unidade. */
  code: string | null;
  /** Nome da pessoa, quando a oferta pede nomes (D20). */
  name: string | null;
  checkedInAt: string | null;
}

export interface CheckInCodeView {
  codes: UnitCode[];
  visibleFrom: string;
  validUntil: string;
}

export interface CheckInByCodeInput {
  offerId: string;
  slotId: string;
  code: string;
  /** Hora do aparelho quando o código foi digitado sem internet. */
  capturedAt?: string;
}

/** Resultado do check-in de uma unidade, com o nome para o parceiro conferir na entrada nominal. */
export interface UnitCheckInResult {
  booking: Booking;
  unit: number;
  name: string | null;
  /** A unidade já tinha check-in: a portaria avisa em vez de deixar entrar de novo. */
  alreadyCheckedIn: boolean;
  checkedInAt: string;
}

/** Códigos de check-in do cliente, um por unidade, e check-in pelo parceiro (D20). */
export class BookingCheckInService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getCheckInCode(actor: BookingActor, bookingId: string): Promise<CheckInCodeView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o cliente vê os códigos; para os demais a reserva responde como inexistente (§7.10).
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (!CHECK_IN_CODE_KINDS.includes(booking.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta reserva não usa código de check-in.'
      );
    }
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não tem código ativo.');
    }
    const { startsAt, durationMinutes } = booking.offerSnapshot;
    const visibleFromMs = checkInCodeVisibleFromMs(startsAt);
    const { closesAtMs } = checkInWindow(startsAt, durationMinutes);
    const nowMs = this.now().getTime();
    const open = nowMs >= visibleFromMs && nowMs <= closesAtMs;
    const participants = await this.port.getParticipants(booking.id);
    const used = new Map(checkInsOf(booking).map((checkIn) => [checkIn.unit, checkIn.at]));
    return {
      codes: Array.from({ length: booking.participantsCount }, (_, unit) => ({
        unit,
        code: open && !used.has(unit) ? deriveCheckInCode(booking.id, undefined, unit) : null,
        name: participants[unit]?.name || null,
        checkedInAt: used.get(unit) ?? null,
      })),
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
    };
  }

  async checkInByCode(actor: BookingActor, input: CheckInByCodeInput): Promise<UnitCheckInResult> {
    const offer = await this.port.getOffer(input.offerId);
    // Só o dono da oferta faz check-in, nem o admin (D20): oferta de outro responde como inexistente.
    if (!offer || offer.ownerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    if (!CHECK_IN_CODE_KINDS.includes(offer.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta oferta não usa código de check-in.'
      );
    }
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }

    const nowDate = this.now();
    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
    if (atMs === null) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora do check-in inválida.');
    }
    const { opensAtMs, closesAtMs } = checkInWindow(slot.startsAt, offer.durationMinutes);
    if (atMs < opensAtMs || atMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'O check-in deste horário não está aberto agora.'
      );
    }

    const since = new Date(nowDate.getTime() - CHECK_IN_FAILURE_WINDOW_MS).toISOString();
    if ((await this.port.countCheckInFailures(slot.id, since)) >= CHECK_IN_MAX_FAILURES) {
      throw new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      );
    }

    const code = normalizeCheckInCode(input.code);
    let match: { booking: Booking; unit: number } | null = null;
    if (code) {
      for (const booking of await this.port.listBookingsBySlot(slot.id)) {
        const active =
          (booking.status === 'confirmed' || booking.status === 'completed') &&
          // Já reembolsada porque o parceiro não veio (D20): os códigos não valem mais.
          booking.providerAbsence?.resolution !== 'refunded';
        const unit = active
          ? matchCheckInCodeUnit(booking.id, booking.participantsCount, code)
          : null;
        if (unit !== null) {
          match = { booking, unit };
          break;
        }
      }
    }
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }

    const checkIn: BookingCheckIn = {
      unit: match.unit,
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: 'code',
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    const before = checkInsOf(match.booking).find((item) => item.unit === match.unit);
    const booking = before
      ? match.booking
      : await this.port.recordCheckIns(match.booking.id, [checkIn]);
    const participants = await this.port.getParticipants(booking.id);
    return {
      booking,
      unit: match.unit,
      name: participants[match.unit]?.name || null,
      alreadyCheckedIn: Boolean(before),
      checkedInAt: before?.at ?? checkIn.at,
    };
  }

  /** Prova do serviço para a contestação no cartão (D16, D20): o "Cliente sem código" não conta. */
  async hasCheckIn(bookingId: string): Promise<boolean> {
    const booking = await this.port.getBooking(bookingId);
    return booking ? hasServiceProof(booking) : false;
  }
}
