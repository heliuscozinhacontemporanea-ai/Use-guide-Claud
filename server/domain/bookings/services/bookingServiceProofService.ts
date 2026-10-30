import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingArrival,
  type BookingProviderAbsence,
  type BookingServiceConfirmation,
  CHECK_IN_CODE_KINDS,
  type NoCodeReason,
} from '../types/bookingTypes';
import {
  ABSENCE_RESPONSE_MS,
  PROVIDER_ABSENT_AFTER_MS,
  SERVICE_CONFIRMATION_MS,
  checkInWindow,
} from '../utils/checkInWindow';

const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
const NOTHING_TO_ANSWER = () =>
  new BookingDomainError('NOTHING_TO_ANSWER', 'Não há nada para responder nesta reserva.');

export interface CheckInWithoutCodeInput {
  offerId: string;
  bookingId: string;
  participantsPresent: number;
  reason: NoCodeReason;
}

/**
 * Prova do serviço sem o código (D20): "Cheguei", "O prestador não veio", "Cliente sem código" e a
 * pergunta "O serviço aconteceu?". Reembolso, multa e avisos ficam na camada application.
 */
export class BookingServiceProofService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async recordArrival(
    actor: BookingActor,
    offerId: string,
    bookingId: string,
    location?: BookingArrival['location']
  ): Promise<Booking> {
    const booking = await this.ownedActiveBooking(actor, offerId, bookingId);
    const arrival: BookingArrival = {
      at: this.now().toISOString(),
      byUid: actor.uid,
      ...(location ? { location } : {}),
    };
    // O primeiro "Cheguei" vale: é dele que conta a espera de 30 min.
    return this.port.updateBooking(
      booking.id,
      (current) => (current.arrival ? null : { ...current, arrival }),
      { actorUid: actor.uid, reason: 'provider_arrived' }
    );
  }

  async checkInWithoutCode(actor: BookingActor, input: CheckInWithoutCodeInput): Promise<Booking> {
    const booking = await this.ownedActiveBooking(actor, input.offerId, input.bookingId);
    if (booking.providerAbsence) {
      throw new BookingDomainError(
        'INVALID_TRANSITION',
        'O comprador relatou sua ausência: responda pelo aviso da reserva.'
      );
    }
    if (input.participantsPresent > booking.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }
    const nowDate = this.now();
    const confirmation = this.question(nowDate, 'no_code');
    return this.port.updateBooking(
      booking.id,
      (current) => {
        if (current.checkIn) return null;
        return {
          ...current,
          checkIn: {
            at: nowDate.toISOString(),
            byUid: actor.uid,
            method: 'no_code',
            participantsPresent: input.participantsPresent,
            noCodeReason: input.reason,
          },
          serviceConfirmation: confirmation,
          deadline: { kind: 'service_confirmation', at: confirmation.answerBy },
        };
      },
      { actorUid: actor.uid, reason: 'checked_in_without_code' }
    );
  }

  /** Confere se o comprador pode relatar "O prestador não veio"; não grava nada. */
  async getBookingForAbsenceReport(actor: BookingActor, bookingId: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    const nowMs = this.now().getTime();
    const { startsAt, durationMinutes } = booking.offerSnapshot;
    const allowed =
      CHECK_IN_CODE_KINDS.includes(booking.kind) &&
      booking.status === 'confirmed' &&
      !booking.checkIn &&
      !booking.providerAbsence &&
      nowMs >= new Date(startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
      nowMs <= checkInWindow(startsAt, durationMinutes).closesAtMs;
    if (!allowed) {
      throw new BookingDomainError(
        'ABSENCE_REPORT_NOT_ALLOWED',
        'Só é possível relatar 30 min depois do horário, sem check-in feito.'
      );
    }
    return booking;
  }

  async recordProviderAbsence(
    actor: BookingActor,
    bookingId: string,
    claimId: string
  ): Promise<Booking> {
    const nowDate = this.now();
    const absence: BookingProviderAbsence = {
      reportedAt: nowDate.toISOString(),
      respondBy: new Date(nowDate.getTime() + ABSENCE_RESPONSE_MS).toISOString(),
      claimId,
    };
    return this.port.updateBooking(
      bookingId,
      (current) =>
        current.providerAbsence
          ? null
          : {
              ...current,
              providerAbsence: absence,
              deadline: { kind: 'provider_absence_response', at: absence.respondBy },
            },
      { actorUid: actor.uid, reason: 'provider_absence_reported' }
    );
  }

  /** Relato de ausência ainda sem resposta nem desfecho, na oferta do prestador. */
  async getOpenProviderAbsence(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking & { providerAbsence: BookingProviderAbsence }> {
    const booking = await this.ownedBooking(actor, offerId, bookingId);
    const absence = booking.providerAbsence;
    if (!absence || absence.resolution) throw NOTHING_TO_ANSWER();
    return { ...booking, providerAbsence: absence };
  }

  async resolveProviderAbsence(
    bookingId: string,
    outcome: Pick<BookingProviderAbsence, 'resolution' | 'answer'>,
    actorUid: string
  ): Promise<Booking> {
    const nowIso = this.now().toISOString();
    return this.port.updateBooking(
      bookingId,
      (current) => {
        if (!current.providerAbsence || current.providerAbsence.resolution) return null;
        return withoutDeadline({
          ...current,
          providerAbsence: {
            ...current.providerAbsence,
            ...(outcome.answer ? { answer: outcome.answer, answeredAt: nowIso } : {}),
            ...(outcome.resolution ? { resolution: outcome.resolution, resolvedAt: nowIso } : {}),
          },
        });
      },
      { actorUid, reason: `provider_absence_${outcome.resolution ?? 'answered'}` }
    );
  }

  /** Pergunta "O serviço aconteceu?" ainda aberta, para o comprador responder. */
  async getPendingConfirmation(
    actor: BookingActor,
    bookingId: string
  ): Promise<Booking & { serviceConfirmation: BookingServiceConfirmation }> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    const confirmation = booking.serviceConfirmation;
    if (
      !confirmation ||
      confirmation.resolution ||
      this.now().toISOString() > confirmation.answerBy
    ) {
      throw NOTHING_TO_ANSWER();
    }
    return { ...booking, serviceConfirmation: confirmation };
  }

  async resolveServiceConfirmation(
    bookingId: string,
    outcome: Pick<BookingServiceConfirmation, 'answer' | 'claimId' | 'resolution'>,
    actorUid: string
  ): Promise<Booking> {
    const nowIso = this.now().toISOString();
    return this.port.updateBooking(
      bookingId,
      (current) => {
        if (!current.serviceConfirmation || current.serviceConfirmation.resolution) return null;
        return withoutDeadline({
          ...current,
          serviceConfirmation: {
            ...current.serviceConfirmation,
            ...outcome,
            ...(outcome.answer ? { answeredAt: nowIso } : {}),
          },
        });
      },
      { actorUid, reason: `service_confirmation_${outcome.resolution}` }
    );
  }

  /** Reservas cujo prazo venceu; o job decide o que fazer com cada uma. */
  listBookingsWithDueDeadline(limit: number): Promise<Booking[]> {
    return this.port.listBookingsWithDeadlineBefore(this.now().toISOString(), limit);
  }

  /** Prazo que já não tem o que esperar (o caso foi resolvido por outro caminho). */
  async clearDeadline(bookingId: string, actorUid: string): Promise<Booking> {
    return this.port.updateBooking(
      bookingId,
      (current) => (current.deadline ? withoutDeadline(current) : null),
      { actorUid, reason: 'deadline_cleared' }
    );
  }

  question(
    nowDate: Date,
    reason: BookingServiceConfirmation['reason']
  ): BookingServiceConfirmation {
    return {
      askedAt: nowDate.toISOString(),
      answerBy: new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString(),
      reason,
    };
  }

  private async ownedBooking(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking> {
    const [offer, booking] = await Promise.all([
      this.port.getOffer(offerId),
      this.port.getBooking(bookingId),
    ]);
    // Só o dono da oferta age na reserva; de outro parceiro responde como inexistente (§7.10).
    if (!offer || offer.ownerId !== actor.uid || booking?.offerId !== offer.id) throw NOT_FOUND();
    return booking;
  }

  /** Reserva confirmada, com código, sem check-in e dentro da janela do serviço. */
  private async ownedActiveBooking(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking> {
    const booking = await this.ownedBooking(actor, offerId, bookingId);
    if (!CHECK_IN_CODE_KINDS.includes(booking.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta reserva usa o QR Code da entrada.'
      );
    }
    if (booking.status !== 'confirmed' || booking.checkIn) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita esta ação.');
    }
    const { opensAtMs, closesAtMs } = checkInWindow(
      booking.offerSnapshot.startsAt,
      booking.offerSnapshot.durationMinutes
    );
    const nowMs = this.now().getTime();
    if (nowMs < opensAtMs || nowMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'Fora da janela do serviço desta reserva.'
      );
    }
    return booking;
  }
}

function withoutDeadline(booking: Booking): Booking {
  const { deadline: _deadline, ...rest } = booking;
  return rest;
}
