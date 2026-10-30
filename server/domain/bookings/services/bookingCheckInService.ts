import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingCheckIn,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';
import {
  checkInCodesMatch,
  deriveCheckInCode,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  CHECK_IN_MAX_FAILURES,
  checkInCodeVisibleFromMs,
  checkInWindow,
  resolveCheckInTime,
} from '../utils/checkInWindow';
import { hasServiceProof } from '../utils/serviceProof';

export interface CheckInCodeView {
  /** null antes das 00:00 do dia do serviço e depois que a janela de check-in fecha. */
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

export interface CheckInByCodeInput {
  offerId: string;
  slotId: string;
  code: string;
  participantsPresent: number;
  /** Hora do aparelho quando o código foi digitado sem internet. */
  capturedAt?: string;
}

/** Código de check-in do comprador e check-in pelo prestador (D20). */
export class BookingCheckInService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getCheckInCode(actor: BookingActor, bookingId: string): Promise<CheckInCodeView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o comprador vê o código; para os demais a reserva responde como inexistente (§7.10).
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
    const visible = nowMs >= visibleFromMs && nowMs <= closesAtMs && !booking.checkIn;
    return {
      code: visible ? deriveCheckInCode(booking.id) : null,
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
      checkedInAt: booking.checkIn?.at ?? null,
    };
  }

  async checkInByCode(actor: BookingActor, input: CheckInByCodeInput): Promise<Booking> {
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
    const bookings = code
      ? (await this.port.listBookingsBySlot(slot.id)).filter(
          (booking) =>
            (booking.status === 'confirmed' || booking.status === 'completed') &&
            // Já reembolsada porque o prestador não veio (D20): o código não vale mais.
            booking.providerAbsence?.resolution !== 'refunded'
        )
      : [];
    const match = code
      ? bookings.find((booking) =>
          listAcceptedCheckInCodes(booking.id).some((accepted) => checkInCodesMatch(accepted, code))
        )
      : undefined;
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    if (input.participantsPresent > match.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }

    const checkIn: BookingCheckIn = {
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: 'code',
      participantsPresent: input.participantsPresent,
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    return this.port.recordCheckIn(match.id, checkIn);
  }

  /** Prova do serviço para a contestação no cartão (D16, D20): o "Cliente sem código" não conta. */
  async hasCheckIn(bookingId: string): Promise<boolean> {
    const booking = await this.port.getBooking(bookingId);
    return booking ? hasServiceProof(booking) : false;
  }
}
