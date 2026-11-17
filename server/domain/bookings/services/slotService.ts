import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { AvailabilitySlot, Booking, BookingActor, PublicSlot } from '../types/bookingTypes';
import { buildSlotId } from '../utils/buildBookingId';
import { getOwnedOffer } from '../utils/ownedOffer';
import { expandSlotRecurrence, type SlotRecurrence } from '../utils/slotRecurrence';

const MAX_SLOTS_PER_REQUEST = 200;

export type CreateSlotsInput =
  | { mode: 'list'; slots: Array<{ startsAt: string; endsAt?: string }>; capacity: number }
  | ({ mode: 'recurrence'; capacity: number } & SlotRecurrence);

/** Horários com vagas das ofertas: abrir, listar, cancelar e remarcar (separado das ofertas na F3b). */
export class SlotService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createSlots(
    actor: BookingActor,
    offerId: string,
    input: CreateSlotsInput
  ): Promise<AvailabilitySlot[]> {
    const offer = await getOwnedOffer(this.port, actor, offerId);
    if (offer.status === 'archived') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não recebe horários.');
    }
    if (!Number.isInteger(input.capacity) || input.capacity < 1) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Capacidade inválida.');
    }

    const requested =
      input.mode === 'list'
        ? input.slots.map((slot) => ({
            startsAt: new Date(slot.startsAt).toISOString(),
            endsAt: slot.endsAt,
          }))
        : expandSlotRecurrence(input, offer.timeZone).map((startsAt) => ({
            startsAt,
            endsAt: undefined,
          }));
    if (requested.length > MAX_SLOTS_PER_REQUEST) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        `No máximo ${MAX_SLOTS_PER_REQUEST} horários por vez.`
      );
    }

    const nowMs = this.now().getTime();
    const timestamp = this.now().toISOString();
    const unique = new Map<string, AvailabilitySlot>();
    for (const slot of requested) {
      if (new Date(slot.startsAt).getTime() <= nowMs) continue;
      const endsAt =
        slot.endsAt ??
        (offer.durationMinutes
          ? new Date(
              new Date(slot.startsAt).getTime() + offer.durationMinutes * 60_000
            ).toISOString()
          : undefined);
      const id = buildSlotId(offerId, slot.startsAt);
      unique.set(id, {
        id,
        offerId,
        startsAt: slot.startsAt,
        ...(endsAt ? { endsAt } : {}),
        capacityTotal: input.capacity,
        capacityReserved: 0,
        capacitySold: 0,
        status: 'open',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    return this.port.createSlots([...unique.values()]);
  }

  async listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]> {
    const offer = await this.port.getOffer(offerId);
    if (offer?.status !== 'published') {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const nowMs = this.now().getTime();
    const slots = await this.port.listSlots(offerId, fromIso, toIso);
    return slots
      .filter((slot) => slot.status === 'open' && new Date(slot.startsAt).getTime() > nowMs)
      .map((slot) => ({
        id: slot.id,
        startsAt: slot.startsAt,
        ...(slot.endsAt ? { endsAt: slot.endsAt } : {}),
        available: Math.max(0, slot.capacityTotal - slot.capacityReserved - slot.capacitySold),
      }));
  }

  /** Resumo para o SEO: menor preço publicado e se há vaga nos próximos 30 dias. */
  async getPublicOfferSummary(
    guideItemId: string
  ): Promise<{ lowestUnitAmountMinor: number; hasAvailability: boolean } | null> {
    const offers = await this.port.listPublishedOffersByGuideItem(guideItemId);
    if (offers.length === 0) return null;
    const lowestUnitAmountMinor = Math.min(
      ...offers.flatMap((offer) =>
        offer.pricing.priceOptions.map((option) => option.unitAmountMinor)
      )
    );
    const nowDate = this.now();
    const fromIso = nowDate.toISOString();
    const toIso = new Date(nowDate.getTime() + 30 * 86_400_000).toISOString();
    for (const offer of offers) {
      const slots = await this.port.listSlots(offer.id, fromIso, toIso);
      if (
        slots.some(
          (slot) =>
            slot.status === 'open' &&
            slot.capacityTotal - slot.capacityReserved - slot.capacitySold > 0
        )
      ) {
        return { lowestUnitAmountMinor, hasAvailability: true };
      }
    }
    return { lowestUnitAmountMinor, hasAvailability: false };
  }

  /** Fecha o horário e devolve as reservas ativas dele (a camada application reembolsa e notifica). */
  async cancelSlot(actor: BookingActor, offerId: string, slotId: string): Promise<Booking[]> {
    await getOwnedOffer(this.port, actor, offerId);
    const slot = await this.port.getSlot(slotId);
    if (slot?.offerId !== offerId) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    if (slot.status !== 'canceled') {
      await this.port.setSlotStatus(slotId, 'canceled');
    }
    const bookings = await this.port.listBookingsBySlot(slotId);
    // As já canceladas pelo parceiro voltam na lista para que um reembolso que falhou possa ser repetido.
    return bookings.filter(
      (booking) =>
        booking.status === 'confirmed' ||
        booking.status === 'pending_payment' ||
        (booking.status === 'canceled' && booking.cancellation?.by === 'partner')
    );
  }

  /**
   * Reagendamento pelo parceiro (D16, 4A): o horário muda e as reservas ativas valem na nova data.
   * Horário cancelado não volta; a nova data precisa ser futura.
   */
  async rescheduleSlot(
    actor: BookingActor,
    offerId: string,
    slotId: string,
    change: { startsAt: string; endsAt?: string; reason: string }
  ): Promise<Booking[]> {
    await getOwnedOffer(this.port, actor, offerId);
    const slot = await this.port.getSlot(slotId);
    if (slot?.offerId !== offerId) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    if (slot.status === 'canceled') {
      throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário cancelado não pode ser remarcado.');
    }
    const startsAt = new Date(change.startsAt);
    const endsAt = change.endsAt ? new Date(change.endsAt) : null;
    if (
      Number.isNaN(startsAt.getTime()) ||
      startsAt.getTime() <= this.now().getTime() ||
      (endsAt && !(endsAt.getTime() > startsAt.getTime()))
    ) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Informe uma nova data futura.');
    }
    return this.port.rescheduleSlot({
      slotId,
      startsAt: startsAt.toISOString(),
      ...(endsAt ? { endsAt: endsAt.toISOString() } : {}),
      actorUid: actor.uid,
      reason: change.reason.slice(0, 300),
    });
  }

  /** Visão do parceiro: inclui vagas reservadas e vendidas e horários fechados ou cancelados. */
  async listOfferSlotsForOwner(
    actor: BookingActor,
    offerId: string,
    fromIso: string,
    toIso: string
  ): Promise<AvailabilitySlot[]> {
    await getOwnedOffer(this.port, actor, offerId);
    return this.port.listSlots(offerId, fromIso, toIso);
  }
}
