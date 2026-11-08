import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import { BookingCreationService, type CreatePendingBookingInput } from './bookingCreationService';

export type { CreatePendingBookingInput } from './bookingCreationService';
import {
  type Booking,
  type BookingActor,
  type BookingCancellation,
  type BookingParticipant,
  CHECK_IN_CODE_KINDS,
  cancellationFamilyOf,
  type Page,
} from '../types/bookingTypes';
import { releaseBookingPromo } from '../utils/bookingPromo';
import { entryWindow, NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
import { hasAnyCheckIn } from '../utils/serviceProof';
import { serviceEndsAtMs } from '../utils/serviceTime';

const SYSTEM_ACTOR = 'system';

export interface BuyerCancellationResult {
  booking: Booking;
  refundPercent: number;
  refundAmountMinor: number;
}

export interface BookingDetails {
  booking: Booking;
  participants: BookingParticipant[];
}

// Reserva que virou venda e não voltou ao comprador (Relatórios, p23).
const SOLD_STATUSES = new Set(['confirmed', 'completed', 'no_show', 'disputed']);

export class BookingService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Reserva as vagas por 15 min; a criação (preço, cupom, contatos) fica em BookingCreationService. */
  createPendingBooking(
    actor: BookingActor,
    input: CreatePendingBookingInput,
    feeConfig: PlatformFeeConfig
  ): Promise<Booking> {
    return new BookingCreationService(this.port, this.now).create(actor, input, feeConfig);
  }

  async getBookingForActor(actor: BookingActor, bookingId: string): Promise<BookingDetails> {
    const booking = await this.port.getBooking(bookingId);
    const allowed =
      booking &&
      (actor.admin || booking.buyerId === actor.uid || booking.sellerPartnerId === actor.uid);
    // Reserva de terceiros responde como inexistente (proteção contra IDOR, AGENTS.md §7.10).
    if (!booking || !allowed) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    return { booking, participants: await this.port.getParticipants(bookingId) };
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    return this.port.getBooking(bookingId);
  }

  /**
   * Pessoas e grupos vendidos por reserva, para Relatórios (p23). Só as reservas do próprio
   * vendedor; cancelada, reembolsada ou não paga não conta.
   */
  async summarizeUnits(
    sellerUid: string,
    bookingIds: string[]
  ): Promise<Record<string, { people: number; groups: number }>> {
    const bookings = await this.port.getBookings([...new Set(bookingIds)]);
    const out: Record<string, { people: number; groups: number }> = {};
    for (const booking of bookings) {
      if (booking.sellerPartnerId !== sellerUid || !SOLD_STATUSES.has(booking.status)) continue;
      const group = booking.offerSnapshot.sellingUnit === 'group';
      out[booking.id] = {
        people: group ? 0 : booking.participantsCount,
        groups: group ? booking.participantsCount : 0,
      };
    }
    return out;
  }

  async listBuyerBookings(actor: BookingActor, page: PageRequest): Promise<Page<Booking>> {
    return this.port.listBookingsByBuyer(actor.uid, page);
  }

  async listOfferBookings(offerId: string, page: PageRequest): Promise<Page<Booking>> {
    return this.port.listBookingsByOffer(offerId, page);
  }

  async confirmBookingPayment(bookingId: string, paymentIntentId: string): Promise<Booking> {
    return this.port.confirmBookingAndCommitCapacity(bookingId, paymentIntentId);
  }

  /** A reserva continua aguardando pagamento: o comprador pode tentar de novo até expirar. */
  async markBookingPaymentFailed(bookingId: string): Promise<void> {
    await this.port.recordBookingAudit(bookingId, 'system:webhook', 'payment_failed');
  }

  /** Reservas confirmadas que começam em [fromIso, toIso), para os lembretes (D25). */
  listConfirmedStartingBetween(fromIso: string, toIso: string, limit = 200): Promise<Booking[]> {
    return this.port.listConfirmedBookingsStartingBetween(fromIso, toIso, limit);
  }

  /** Devolve as vagas das reservas não pagas no prazo; retorna as que expiraram agora. */
  async expireOverdueBookings(limit = 200): Promise<Booking[]> {
    const overdue = await this.port.listExpiredPendingBookings(this.now().toISOString(), limit);
    const expired: Booking[] = [];
    for (const booking of overdue) {
      try {
        await this.port.releaseCapacityAndSetStatus({
          bookingId: booking.id,
          to: 'expired',
          actorUid: SYSTEM_ACTOR,
          reason: 'payment_window_elapsed',
        });
        await releaseBookingPromo(booking);
        expired.push(booking);
      } catch (error) {
        // Uma reserva confirmada no meio do caminho não pode travar as demais.
        if (!(error instanceof BookingDomainError)) throw error;
      }
    }
    return expired;
  }

  /** Cancela pelo comprador e devolve o reembolso devido. Repetir devolve o mesmo resultado. */
  async requestCancellationByBuyer(
    actor: BookingActor,
    bookingId: string,
    reason: string
  ): Promise<BuyerCancellationResult> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (booking.status === 'canceled' && booking.cancellation?.by === 'buyer') {
      return {
        booking,
        refundPercent: booking.cancellation.refundPercent,
        refundAmountMinor: booking.cancellation.refundAmountMinor,
      };
    }
    if (booking.status !== 'confirmed') {
      throw new BookingDomainError(
        'CANCELLATION_NOT_ALLOWED',
        'Esta reserva não pode ser cancelada.'
      );
    }
    const nowDate = this.now();
    // D14: arrependimento de 7 dias até 48 h antes do início; D16: 7 dias depois do reagendamento; senão a política.
    const calculated = calculateBuyerRefund({
      family: cancellationFamilyOf(booking.kind),
      policy: booking.offerSnapshot.cancellationPolicy,
      purchasedAt: booking.createdAt,
      startsAt: booking.offerSnapshot.startsAt,
      now: nowDate,
      paidMinor: booking.totalMinor,
      serviceFeeMinor: 0,
      rescheduledAt: booking.rescheduledAt,
    });
    // Sem reembolso não há o que cancelar: a reserva paga continua valendo até a data do serviço.
    if (calculated.refundMinor <= 0) {
      throw new BookingDomainError(
        'CANCELLATION_NOT_ALLOWED',
        'O prazo de cancelamento terminou. Sua reserva continua valendo.'
      );
    }
    const refund = {
      refundPercent: calculated.percent,
      refundAmountMinor: calculated.refundMinor,
    };
    const cancellation: BookingCancellation = {
      by: 'buyer',
      ...refund,
      reason: reason.slice(0, 300),
      at: nowDate.toISOString(),
    };
    const updated = await this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid: actor.uid,
      reason: 'buyer_canceled',
      cancellation,
    });
    return { booking: updated, ...refund };
  }

  /** Desfaz a reserva pendente quando o pagamento nem chegou a ser criado. */
  async cancelPendingBooking(bookingId: string, reason: string): Promise<Booking> {
    const canceled = await this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid: SYSTEM_ACTOR,
      reason,
    });
    await releaseBookingPromo(canceled);
    return canceled;
  }

  /** Cancela uma reserva do horário cancelado pelo parceiro: reembolso sempre integral. */
  async cancelBookingForCanceledSlot(bookingId: string, actorUid: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (booking.status === 'canceled') {
      return booking;
    }
    return this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid,
      reason: 'slot_canceled_by_partner',
      cancellation: {
        by: 'partner',
        refundPercent: 100,
        refundAmountMinor: booking.status === 'confirmed' ? booking.totalMinor : 0,
        reason: 'slot_canceled',
        at: this.now().toISOString(),
      },
    });
  }

  async markBookingRefunded(bookingId: string): Promise<Booking> {
    return this.port.setBookingStatus({
      bookingId,
      to: 'refunded',
      actorUid: 'system:webhook',
      reason: 'refund_succeeded',
    });
  }

  async markBookingDisputed(bookingId: string): Promise<Booking> {
    return this.port.setBookingStatus({
      bookingId,
      to: 'disputed',
      actorUid: 'system:webhook',
      reason: 'dispute_created',
    });
  }

  async markBookingNoShow(actor: BookingActor, bookingId: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || (!actor.admin && booking.sellerPartnerId !== actor.uid)) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (this.now().getTime() < new Date(booking.offerSnapshot.startsAt).getTime()) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Só é possível marcar após o início.');
    }
    // Check-in prova que o comprador apareceu (D20).
    if (hasAnyCheckIn(booking)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Reserva com check-in não é ausência.');
    }
    if (CHECK_IN_CODE_KINDS.includes(booking.kind)) {
      // D20: ausência só depois do "Cheguei" e de 30 min de espera, e sem relato de que o prestador faltou.
      const waitedUntil = booking.arrival
        ? new Date(booking.arrival.at).getTime() + NO_SHOW_WAIT_MS
        : Number.POSITIVE_INFINITY;
      if (this.now().getTime() < waitedUntil) {
        throw new BookingDomainError(
          'NO_SHOW_TOO_EARLY',
          'Toque em "Cheguei" e espere 30 min antes de marcar a ausência.'
        );
      }
      if (booking.providerAbsence) {
        throw new BookingDomainError(
          'INVALID_TRANSITION',
          'O comprador relatou sua ausência: responda pelo aviso da reserva.'
        );
      }
    }
    return this.port.setBookingStatus({
      bookingId,
      to: 'no_show',
      actorUid: actor.uid,
      reason: 'no_show',
    });
  }

  /**
   * Conclui as reservas cujo horário terminou. Sem check-in nem outro registro, o comprador recebe a
   * pergunta "O serviço aconteceu?" (D20); essas reservas voltam em `askedToConfirm`. A entrada de
   * atração não usada vira ausência e conta em `completed`.
   */
  async completeFinishedBookings(
    limit = 200
  ): Promise<{ completed: number; askedToConfirm: Booking[]; reviewInvites: Booking[] }> {
    const nowDate = this.now();
    const started = await this.port.listConfirmedBookingsStartedBefore(
      nowDate.toISOString(),
      limit
    );
    let completed = 0;
    const askedToConfirm: Booking[] = [];
    // Serviço que aconteceu (sem pergunta pendente nem ausência): convite para avaliar (D25).
    const reviewInvites: Booking[] = [];
    for (const booking of started) {
      if ((await this.serviceEndMs(booking)) > nowDate.getTime()) continue;
      // Entrada de atração não usada até o fechamento é ausência, como ingresso não usado (D20, A).
      const unusedEntry = booking.kind === 'private_entry' && !hasAnyCheckIn(booking);
      const ask =
        CHECK_IN_CODE_KINDS.includes(booking.kind) &&
        !hasAnyCheckIn(booking) &&
        !booking.providerAbsence &&
        !booking.serviceConfirmation;
      const updated = await this.port.updateBooking(
        booking.id,
        (current) => {
          if (current.status !== 'confirmed') return null;
          if (unusedEntry) return { ...current, status: 'no_show' };
          if (!ask) return { ...current, status: 'completed' };
          const answerBy = new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString();
          return {
            ...current,
            status: 'completed',
            serviceConfirmation: { askedAt: nowDate.toISOString(), answerBy, reason: 'no_record' },
            deadline: { kind: 'service_confirmation', at: answerBy },
          };
        },
        { actorUid: SYSTEM_ACTOR, reason: unusedEntry ? 'entry_unused' : 'finished' }
      );
      if (updated.status === 'confirmed') continue;
      completed += 1;
      if (ask && updated.status === 'completed') askedToConfirm.push(updated);
      else if (updated.status === 'completed' && !updated.providerAbsence)
        reviewInvites.push(updated);
    }
    return { completed, askedToConfirm, reviewInvites };
  }

  /** Fim do serviço; a entrada de atração vale até o fechamento do horário (D20). */
  private async serviceEndMs(booking: Booking): Promise<number> {
    const { startsAt, durationMinutes, timeZone } = booking.offerSnapshot;
    if (booking.kind !== 'private_entry') return serviceEndsAtMs(startsAt, durationMinutes);
    const slot = await this.port.getSlot(booking.slotId);
    return entryWindow(slot ?? { startsAt }, durationMinutes, timeZone).closesAtMs;
  }
}
