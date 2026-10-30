import type { Locale } from '../../../shared/kernel/locale';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingCancellation,
  type BookingParticipant,
  CHECK_IN_CODE_KINDS,
  cancellationFamilyOf,
  type Page,
} from '../types/bookingTypes';
import { NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
import { buildBookingId } from '../utils/buildBookingId';
import { priceBookingLines } from '../utils/bookingPricing';
import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
import { isCurrentBuyerTermsVersion } from '../../../shared/kernel/legalTerms';
import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';

// Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const SYSTEM_ACTOR = 'system';

export interface CreatePendingBookingInput {
  offerId: string;
  slotId: string;
  lines: Array<{ priceOptionId: string; quantity: number }>;
  participants: Array<{ name: string }>;
  idempotencyKey: string;
  locale: Locale;
  acceptedTermsVersion: string;
  /** Obrigatório quando a oferta busca o comprador no endereço (D20). */
  pickupAddress?: string;
}

export interface BuyerCancellationResult {
  booking: Booking;
  refundPercent: number;
  refundAmountMinor: number;
}

export interface BookingDetails {
  booking: Booking;
  participants: BookingParticipant[];
}

export class BookingService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createPendingBooking(
    actor: BookingActor,
    input: CreatePendingBookingInput,
    feeConfig: PlatformFeeConfig
  ): Promise<Booking> {
    // D15: sem o aceite da versão atual dos termos não há compra.
    if (!isCurrentBuyerTermsVersion(input.acceptedTermsVersion)) {
      throw new BookingDomainError(
        'TERMS_NOT_ACCEPTED',
        'Aceite os termos de compra para continuar.'
      );
    }
    const offer = await this.port.getOffer(input.offerId);
    if (offer?.status !== 'published') {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Horário não pertence a esta oferta.');
    }
    const priced = priceBookingLines(offer, input.lines, feeConfig);

    const names = input.participants.map((participant) => participant.name.trim());
    if (offer.requiresParticipantNames) {
      if (names.length !== priced.participantsCount) {
        throw new BookingDomainError('VALIDATION_ERROR', 'Informe o nome de cada participante.');
      }
      if (names.some((name) => name.length < 2 || name.length > 80)) {
        throw new BookingDomainError('VALIDATION_ERROR', 'Nome de participante inválido.');
      }
    }

    const pickupAddress = input.pickupAddress?.trim() ?? '';
    if (
      offer.pickupMode === 'buyer_address' &&
      (pickupAddress.length < 3 || pickupAddress.length > 300)
    ) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Informe onde você está hospedado.');
    }

    const nowDate = this.now();
    const timestamp = nowDate.toISOString();
    const booking: Booking = {
      id: buildBookingId(actor.uid, input.idempotencyKey),
      offerId: offer.id,
      slotId: slot.id,
      guideItemId: offer.guideItemId,
      buyerId: actor.uid,
      sellerPartnerId: offer.partnerId,
      kind: offer.kind,
      status: 'pending_payment',
      ...priced,
      expiresAt: new Date(nowDate.getTime() + PAYMENT_WINDOW_MS).toISOString(),
      offerSnapshot: {
        title: offer.title['pt-BR'],
        startsAt: slot.startsAt,
        ...(offer.durationMinutes ? { durationMinutes: offer.durationMinutes } : {}),
        ...(offer.meetingPoint ? { meetingPoint: offer.meetingPoint.address } : {}),
        cancellationPolicy: offer.cancellationPolicy,
      },
      termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
      ...(offer.pickupMode === 'buyer_address' ? { pickupAddress } : {}),
      locale: input.locale,
      idempotencyKey: input.idempotencyKey,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const participants = offer.requiresParticipantNames
      ? names.map((name, index) => ({ name, isLeadContact: index === 0 }))
      : [];
    return this.port.reserveCapacityAndCreateBooking(booking, participants);
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

  async expireOverdueBookings(limit = 200): Promise<number> {
    const overdue = await this.port.listExpiredPendingBookings(this.now().toISOString(), limit);
    let expired = 0;
    for (const booking of overdue) {
      try {
        await this.port.releaseCapacityAndSetStatus({
          bookingId: booking.id,
          to: 'expired',
          actorUid: SYSTEM_ACTOR,
          reason: 'payment_window_elapsed',
        });
        expired += 1;
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
    return this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid: SYSTEM_ACTOR,
      reason,
    });
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
    if (booking.checkIn) {
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
   * pergunta "O serviço aconteceu?" (D20); essas reservas voltam em `askedToConfirm`.
   */
  async completeFinishedBookings(
    limit = 200
  ): Promise<{ completed: number; askedToConfirm: Booking[] }> {
    const nowDate = this.now();
    const started = await this.port.listConfirmedBookingsStartedBefore(
      nowDate.toISOString(),
      limit
    );
    let completed = 0;
    const askedToConfirm: Booking[] = [];
    for (const booking of started) {
      const endsAtMs =
        new Date(booking.offerSnapshot.startsAt).getTime() +
        (booking.offerSnapshot.durationMinutes ?? 0) * 60_000;
      if (endsAtMs > nowDate.getTime()) continue;
      const ask =
        CHECK_IN_CODE_KINDS.includes(booking.kind) &&
        !booking.checkIn &&
        !booking.providerAbsence &&
        !booking.serviceConfirmation;
      const updated = await this.port.updateBooking(
        booking.id,
        (current) => {
          if (current.status !== 'confirmed') return null;
          if (!ask) return { ...current, status: 'completed' };
          const answerBy = new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString();
          return {
            ...current,
            status: 'completed',
            serviceConfirmation: { askedAt: nowDate.toISOString(), answerBy, reason: 'no_record' },
            deadline: { kind: 'service_confirmation', at: answerBy },
          };
        },
        { actorUid: SYSTEM_ACTOR, reason: 'finished' }
      );
      if (updated.status !== 'completed') continue;
      completed += 1;
      if (ask) askedToConfirm.push(updated);
    }
    return { completed, askedToConfirm };
  }
}
