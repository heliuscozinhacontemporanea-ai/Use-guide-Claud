import {
  canChangeCancellationPolicy,
  isCancellationPolicyAllowed,
} from '../../../shared/kernel/cancellationPolicy';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  AVAILABLE_OFFER_KINDS,
  type AvailabilitySlot,
  type BookableOffer,
  type BookableOfferKind,
  type BookableOfferStatus,
  type Booking,
  type BookingActor,
  type PublicBookableOffer,
  cancellationFamilyOf,
  type PublicSlot,
} from '../types/bookingTypes';
import { buildSlotId } from '../utils/buildBookingId';
import { expandSlotRecurrence, type SlotRecurrence } from '../utils/slotRecurrence';

const MAX_SLOTS_PER_REQUEST = 200;

// Fase 1: passeio vende horário de passeio; atração privada vende entrada (decisão D3).
const CATEGORY_BY_KIND: Partial<Record<BookableOfferKind, string>> = {
  tour: 'tour',
  private_entry: 'sight',
};

const OFFER_STATUS_TRANSITIONS: Record<BookableOfferStatus, readonly BookableOfferStatus[]> = {
  draft: ['published', 'archived'],
  published: ['paused', 'archived'],
  paused: ['published', 'archived'],
  archived: [],
};

export type OfferInput = Pick<
  BookableOffer,
  | 'title'
  | 'description'
  | 'pricing'
  | 'durationMinutes'
  | 'meetingPoint'
  | 'pickupMode'
  | 'cancellationPolicy'
  | 'maxParticipantsPerBooking'
  | 'requiresParticipantNames'
>;

export type CreateSlotsInput =
  | { mode: 'list'; slots: Array<{ startsAt: string; endsAt?: string }>; capacity: number }
  | ({ mode: 'recurrence'; capacity: number } & SlotRecurrence);

function assertPolicyForKind(kind: BookableOfferKind, policy: string): void {
  if (!isCancellationPolicyAllowed(cancellationFamilyOf(kind), policy)) {
    throw new BookingDomainError(
      'VALIDATION_ERROR',
      'Política de cancelamento não disponível para este tipo de oferta.'
    );
  }
}

function assertValidPricing(pricing: BookableOffer['pricing']): void {
  if (pricing.priceOptions.length === 0) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Informe ao menos uma opção de preço.');
  }
  for (const option of pricing.priceOptions) {
    if (!Number.isInteger(option.unitAmountMinor) || option.unitAmountMinor <= 0) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Preço deve ser um valor inteiro em centavos.'
      );
    }
  }
}

export function toPublicOffer(offer: BookableOffer): PublicBookableOffer {
  const { ownerId: _owner, partnerId: _partner, createdAt: _created, ...publicFields } = offer;
  return publicFields;
}

export class OfferService {
  constructor(
    private readonly port: BookingsPort,
    private readonly items: BookableItemLookupPort,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: () => string = () => crypto.randomUUID()
  ) {}

  async createOffer(
    actor: BookingActor,
    input: OfferInput & { guideItemId: string; kind: BookableOfferKind }
  ): Promise<BookableOffer> {
    if (!AVAILABLE_OFFER_KINDS.includes(input.kind)) {
      throw new BookingDomainError(
        'KIND_NOT_AVAILABLE',
        'Este tipo de oferta ainda não está disponível.'
      );
    }
    const item = await this.items.getItem(input.guideItemId);
    if (!item) {
      throw new BookingDomainError('NOT_FOUND', 'Item do guia não encontrado.');
    }
    if (!actor.admin && item.ownerId !== actor.uid) {
      throw new BookingDomainError('FORBIDDEN', 'Você não é o dono deste item.');
    }
    if (CATEGORY_BY_KIND[input.kind] !== item.category) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Tipo de oferta incompatível com o item.');
    }
    assertValidPricing(input.pricing);
    assertPolicyForKind(input.kind, input.cancellationPolicy);

    const timestamp = this.now().toISOString();
    const offer: BookableOffer = {
      ...input,
      id: `offer_${this.newId()}`,
      ownerId: item.ownerId,
      partnerId: item.partnerId,
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this.port.createOffer(offer);
    return offer;
  }

  async updateOffer(
    actor: BookingActor,
    offerId: string,
    input: Partial<OfferInput>
  ): Promise<BookableOffer> {
    const offer = await this.getOwnedOffer(actor, offerId);
    if (offer.status === 'archived') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não pode ser editada.');
    }
    if (input.pricing) assertValidPricing(input.pricing);
    if (input.cancellationPolicy) {
      assertPolicyForKind(offer.kind, input.cancellationPolicy);
      // D14: depois de publicar, a política só fica igual ou mais flexível (protege quem já reservou).
      const family = cancellationFamilyOf(offer.kind);
      if (
        offer.status !== 'draft' &&
        !canChangeCancellationPolicy(family, offer.cancellationPolicy, input.cancellationPolicy)
      ) {
        throw new BookingDomainError(
          'POLICY_CHANGE_NOT_ALLOWED',
          'Depois de publicar, a política de cancelamento só pode ficar mais flexível.'
        );
      }
    }
    const updated: BookableOffer = { ...offer, ...input, updatedAt: this.now().toISOString() };
    await this.port.saveOffer(updated);
    if (updated.status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
    }
    return updated;
  }

  /** `beforePublish` recebe a oferta antes de ela ficar pública e pode recusar lançando um erro. */
  async setOfferStatus(
    actor: BookingActor,
    offerId: string,
    status: Exclude<BookableOfferStatus, 'draft'>,
    beforePublish?: (offer: BookableOffer) => Promise<void>
  ): Promise<BookableOffer> {
    const offer = await this.getOwnedOffer(actor, offerId);
    if (offer.status === status) return offer;
    if (!OFFER_STATUS_TRANSITIONS[offer.status].includes(status)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
    }
    if (status === 'published' && beforePublish) {
      await beforePublish(offer);
    }
    const updated: BookableOffer = { ...offer, status, updatedAt: this.now().toISOString() };
    await this.port.saveOffer(updated);
    if (status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
    } else {
      await this.port.deletePublicOfferProjection(offerId);
    }
    return updated;
  }

  async listOwnerOffers(actor: BookingActor): Promise<BookableOffer[]> {
    return this.port.listOffersByOwner(actor.uid);
  }

  async createSlots(
    actor: BookingActor,
    offerId: string,
    input: CreateSlotsInput
  ): Promise<AvailabilitySlot[]> {
    const offer = await this.getOwnedOffer(actor, offerId);
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
        : expandSlotRecurrence(input).map((startsAt) => ({ startsAt, endsAt: undefined }));
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
    await this.getOwnedOffer(actor, offerId);
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
    await this.getOwnedOffer(actor, offerId);
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
    await this.getOwnedOffer(actor, offerId);
    return this.port.listSlots(offerId, fromIso, toIso);
  }

  async getOwnedOffer(actor: BookingActor, offerId: string): Promise<BookableOffer> {
    const offer = await this.port.getOffer(offerId);
    // Oferta de outro parceiro responde como inexistente: não revela que o ID existe.
    if (!offer || (!actor.admin && offer.ownerId !== actor.uid)) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    return offer;
  }
}
