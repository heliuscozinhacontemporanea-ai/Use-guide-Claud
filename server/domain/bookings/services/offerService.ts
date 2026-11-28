import { canChangeCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
import { findContactsInText } from '../../../shared/kernel/contactInText';
import { placeTimeOf } from '../../../shared/kernel/timeZones';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort } from '../ports/bookingsPort';
import type { ListingCardSummaryPort } from '../ports/listingCardSummaryPort';
import {
  type BookableOffer,
  type BookableOfferKind,
  type BookableOfferStatus,
  type BookingActor,
  cancellationFamilyOf,
  type PublicBookableOffer,
} from '../types/bookingTypes';
import { assertKindFields, normalizeFleet } from '../utils/fleetOfferRules';
import { itemCardSummary } from '../utils/offerCardSummary';
import { assertPolicyForKind, assertSellingUnit, assertValidPricing } from '../utils/offerRules';
import { getOwnedOffer } from '../utils/ownedOffer';

// Passeio vende horário; atração privada, entrada; aluguel e translado, por veículo (D3; F3 da D34).
const CATEGORY_BY_KIND: Record<BookableOfferKind, string> = {
  tour: 'tour',
  private_entry: 'sight',
  rental: 'rental',
  transfer: 'transfer',
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
  | 'sellingUnit'
  | 'groupMaxPeople'
  | 'cancellationPolicy'
  | 'maxParticipantsPerBooking'
  | 'requiresParticipantNames'
  | 'vehicle'
  | 'route'
  | 'requiresDriverLicense'
  | 'fleet'
>;

/** O que define como a oferta vende (por veículo ou por pessoa, qual veículo, qual trecho). */
function changesSaleModel(before: BookableOffer, after: BookableOffer): boolean {
  return (
    before.vehicle !== after.vehicle ||
    before.route?.from !== after.route?.from ||
    before.route?.to !== after.route?.to ||
    (before.kind === 'transfer' && before.sellingUnit !== after.sellingUnit)
  );
}

export function toPublicOffer(offer: BookableOffer): PublicBookableOffer {
  const { ownerId: _owner, partnerId: _partner, createdAt: _created, ...publicFields } = offer;
  return publicFields;
}

/** Textos da oferta sem contato nem chave Pix (C2/B37): o contato vem com o pedido. */
function assertNoContactInOffer(input: Partial<OfferInput>): void {
  const texts = [
    input.title,
    input.description,
    input.meetingPoint?.instructions,
    ...(input.pricing?.priceOptions ?? []).map((option) => option.label),
  ];
  for (const text of texts) {
    for (const value of Object.values(text ?? {})) {
      if (typeof value === 'string' && findContactsInText(value).length > 0) {
        throw new BookingDomainError(
          'CONTACT_IN_TEXT',
          'Tire telefone, e-mail, links, @ e chave Pix dos textos da oferta.'
        );
      }
    }
  }
}

export class OfferService {
  constructor(
    private readonly port: BookingsPort,
    private readonly items: BookableItemLookupPort,
    private readonly cardSummaries: ListingCardSummaryPort,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: () => string = () => crypto.randomUUID()
  ) {}

  async createOffer(
    actor: BookingActor,
    input: OfferInput & { guideItemId: string; kind: BookableOfferKind }
  ): Promise<BookableOffer> {
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
    assertNoContactInOffer(input);
    assertPolicyForKind(input.kind, input.cancellationPolicy);
    assertSellingUnit(input.kind, input.sellingUnit, input.groupMaxPeople);
    assertKindFields(input.kind, input, item);

    const timestamp = this.now().toISOString();
    const fleet = normalizeFleet(input.kind, input);
    const offer: BookableOffer = {
      ...input,
      ...(fleet ? { fleet } : {}),
      ...(item.name ? { businessName: item.name } : {}),
      ...placeTimeOf(item),
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
    assertNoContactInOffer(input);
    assertSellingUnit(
      offer.kind,
      input.sellingUnit ?? offer.sellingUnit,
      input.groupMaxPeople ?? offer.groupMaxPeople
    );
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
    // O fuso segue o do estabelecimento, que pode ter mudado de cidade desde a criação (D28).
    const item = await this.items.getItem(offer.guideItemId);
    const merged = { ...offer, ...input };
    if (offer.status !== 'draft' && changesSaleModel(offer, merged)) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Depois de publicar, veículo, trecho e tipo do translado não mudam.'
      );
    }
    if (item) assertKindFields(offer.kind, merged, item);
    const fleet = normalizeFleet(offer.kind, merged);
    const updated: BookableOffer = {
      ...merged,
      ...(fleet ? { fleet } : {}),
      ...(item ? placeTimeOf(item) : {}),
      updatedAt: this.now().toISOString(),
    };
    await this.port.saveOffer(updated);
    if (updated.status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
      await this.refreshItemCardSummary(updated.guideItemId);
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
    if (status === 'published') {
      // Rascunho do anúncio não vende (D34, B68): a oferta só vai à venda com o anúncio publicado.
      const item = await this.items.getItem(offer.guideItemId);
      if (!item?.published) {
        throw new BookingDomainError(
          'LISTING_NOT_PUBLISHED',
          'Publique o anúncio antes de pôr a oferta à venda.'
        );
      }
      if (beforePublish) await beforePublish(offer);
    }
    const updated: BookableOffer = { ...offer, status, updatedAt: this.now().toISOString() };
    await this.port.saveOffer(updated);
    if (status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
    } else {
      await this.port.deletePublicOfferProjection(offerId);
    }
    await this.refreshItemCardSummary(updated.guideItemId);
    return updated;
  }

  /** "A partir de", duração e cancelamento do cartão do anúncio, pelas ofertas à venda (D37 item 10). */
  async refreshItemCardSummary(guideItemId: string): Promise<void> {
    const offers = await this.port.listPublishedOffersByGuideItem(guideItemId);
    await this.cardSummaries.setItemCardSummary(guideItemId, itemCardSummary(offers));
  }

  async listOwnerOffers(actor: BookingActor): Promise<BookableOffer[]> {
    return this.port.listOffersByOwner(actor.uid);
  }

  /**
   * Se alguma oferta do item do guia tem reserva aguardando pagamento ou confirmada: enquanto houver,
   * o anúncio não é excluído (o parceiro cancela os horários pela agenda, com reembolso e multa).
   */
  async hasActiveBookingsForGuideItem(guideItemId: string): Promise<boolean> {
    return this.anyActiveBookings(await this.port.listOffersByGuideItem(guideItemId));
  }

  /** O mesmo, para todas as ofertas do dono (trava de excluir a conta ou o perfil de parceiro). */
  async hasActiveBookingsForOwner(ownerId: string): Promise<boolean> {
    return this.anyActiveBookings(await this.port.listOffersByOwner(ownerId));
  }

  private async anyActiveBookings(offers: BookableOffer[]): Promise<boolean> {
    for (const offer of offers) {
      if (await this.port.hasActiveBookings(offer.id)) return true;
    }
    return false;
  }

  /**
   * Anúncio excluído: as ofertas dele saem do app (arquivadas, sem a cópia pública). As reservas
   * antigas ficam guardadas, pela retenção legal (AGENTS.md §7.5).
   */
  async archiveOffersOfGuideItem(guideItemId: string): Promise<void> {
    await this.archiveOffers(await this.port.listOffersByGuideItem(guideItemId));
  }

  /** Conta ou perfil de parceiro encerrado: as ofertas do dono saem do app. */
  async archiveOffersByOwner(ownerId: string): Promise<void> {
    await this.archiveOffers(await this.port.listOffersByOwner(ownerId));
  }

  private async archiveOffers(offers: BookableOffer[]): Promise<void> {
    for (const offer of offers) {
      if (offer.status !== 'archived') {
        await this.port.saveOffer({
          ...offer,
          status: 'archived',
          updatedAt: this.now().toISOString(),
        });
      }
      await this.port.deletePublicOfferProjection(offer.id);
    }
    for (const guideItemId of new Set(offers.map((offer) => offer.guideItemId))) {
      await this.cardSummaries.setItemCardSummary(guideItemId, null);
    }
  }

  getOwnedOffer(actor: BookingActor, offerId: string): Promise<BookableOffer> {
    return getOwnedOffer(this.port, actor, offerId);
  }
}
