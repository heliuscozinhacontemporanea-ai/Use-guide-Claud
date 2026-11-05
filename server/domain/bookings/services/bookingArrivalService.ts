import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type AvailabilitySlot,
  type BookableOffer,
  type Booking,
  type BookingActor,
  type BookingArrival,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';
import { hasAnyCheckIn } from '../utils/serviceProof';
import { serviceEndsAtMs } from '../utils/serviceTime';

/** Reserva do horário que ainda espera o cliente: o contato do cartão "Cheguei" (p42). */
export interface SlotContact {
  booking: Booking;
  phone: string;
}

const waiting = (booking: Booking) =>
  booking.status === 'confirmed' &&
  !hasAnyCheckIn(booking) &&
  booking.arrivalResponse?.response !== 'not_going' &&
  // Já reembolsada porque o parceiro não veio (D20): não há mais quem esperar.
  booking.providerAbsence?.resolution !== 'refunded';

/**
 * "Cheguei" do horário inteiro, contatos dos clientes que ainda não chegaram e as respostas
 * "Estou chegando" e "Não vou mais" (D27).
 */
export class BookingArrivalService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  private async ownedSlot(
    actor: BookingActor,
    offerId: string,
    slotId: string
  ): Promise<{ offer: BookableOffer; slot: AvailabilitySlot }> {
    const offer = await this.port.getOffer(offerId);
    // Só o dono, nem o admin; de outro, como inexistente (§7.10).
    if (!offer || offer.ownerId !== actor.uid || !CHECK_IN_CODE_KINDS.includes(offer.kind)) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const slot = await this.port.getSlot(slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    return { offer, slot };
  }

  /** O primeiro "Cheguei" de cada reserva vale: é dele que conta a espera de 30 min (D20). */
  async recordSlotArrival(
    actor: BookingActor,
    offerId: string,
    slotId: string,
    location?: BookingArrival['location']
  ): Promise<Booking[]> {
    await this.ownedSlot(actor, offerId, slotId);
    const arrival: BookingArrival = {
      at: this.now().toISOString(),
      byUid: actor.uid,
      ...(location ? { location } : {}),
    };
    const open = (await this.port.listBookingsBySlot(slotId)).filter(waiting);
    return Promise.all(
      open.map((booking) =>
        this.port.updateBooking(
          booking.id,
          (current) => (current.arrival ? null : { ...current, arrival }),
          { actorUid: actor.uid, reason: 'provider_arrived' }
        )
      )
    );
  }

  /**
   * Telefones dos clientes que ainda não chegaram (D27): só depois do "Cheguei" e até o fim do
   * horário. Some com o código, com a ausência ou com o "Não vou mais". Cada leitura fica na
   * auditoria da reserva (quem, quando).
   */
  async listSlotContacts(
    actor: BookingActor,
    offerId: string,
    slotId: string
  ): Promise<SlotContact[]> {
    const { offer, slot } = await this.ownedSlot(actor, offerId, slotId);
    const nowMs = this.now().getTime();
    if (nowMs > serviceEndsAtMs(slot.startsAt, offer.durationMinutes)) return [];
    const contacts = (await this.port.listBookingsBySlot(slotId))
      .filter((booking) => waiting(booking) && booking.arrival && booking.contactPhone)
      .map((booking) => ({ booking, phone: booking.contactPhone as string }));
    await Promise.all(
      contacts.map(({ booking }) =>
        this.port.recordBookingAudit(booking.id, actor.uid, 'contact_phone_viewed')
      )
    );
    return contacts;
  }

  /**
   * Resposta do cliente ao aviso "chegou" (D27). "Não vou mais" conta como ausência, sem reembolso,
   * igual ao no-show da D20: o parceiro fica livre na hora, sem esperar os 30 min.
   */
  async respondToArrival(
    actor: BookingActor,
    bookingId: string,
    response: 'coming' | 'not_going'
  ): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (!booking.arrival || !waiting(booking)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Não há chegada para responder agora.');
    }
    const at = this.now().toISOString();
    const answered = await this.port.updateBooking(
      booking.id,
      (current) =>
        current.arrivalResponse?.response === 'not_going'
          ? null
          : { ...current, arrivalResponse: { response, at } },
      { actorUid: actor.uid, reason: `arrival_response_${response}` }
    );
    if (response === 'coming') return answered;
    return this.port.setBookingStatus({
      bookingId: booking.id,
      to: 'no_show',
      actorUid: actor.uid,
      reason: 'buyer_not_going',
    });
  }
}
