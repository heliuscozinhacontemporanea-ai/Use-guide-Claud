import { placeTimeOf } from '../../../shared/kernel/timeZones';
import { isCurrentBuyerTermsVersion } from '../../../shared/kernel/legalTerms';
import type { Locale } from '../../../shared/kernel/locale';
import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import { type Booking, type BookingActor, CHECK_IN_CODE_KINDS } from '../types/bookingTypes';
import { applyBookingPromo, loadBookingPromo, withBookingPromoUse } from '../utils/bookingPromo';
import { priceBookingLines } from '../utils/bookingPricing';
import { buildBookingId } from '../utils/buildBookingId';
import { serviceEndsAtMs } from '../utils/serviceTime';

// Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
// O endereço serve de prova até a reclamação ser decidida: 48 h para abrir mais 5 dias para decidir (D16).
const CONTACT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
// Telefone em E.164 (§12.4): +, código do país e até 15 dígitos.
const E164 = /^\+[1-9]\d{7,14}$/;

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
  /** Telefone do cliente em E.164; obrigatório em passeio, aluguel e translado (D27). */
  contactPhone?: string;
  /** Cupom digitado na compra (B1c). */
  promoCode?: string;
}

/** Criação da reserva: preço no servidor, cupom, nomes, contatos e as vagas por 15 min. */
export class BookingCreationService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async create(
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
    const listed = priceBookingLines(offer, input.lines, feeConfig);
    // Cupom (B1c): desconto sobre o valor da reserva; a taxa da plataforma incide no valor com desconto.
    const promo = await loadBookingPromo(input.promoCode, offer.id, actor.uid);
    const priced = promo ? applyBookingPromo(listed, promo, feeConfig) : listed;

    // Entrada nominal (D20): os nomes podem vir agora ou depois da compra, até o dia; venda por grupo
    // não tem nomes, porque o cliente decide quem leva.
    const named = offer.requiresParticipantNames && offer.sellingUnit !== 'group';
    const names = named ? input.participants.map((participant) => participant.name.trim()) : [];
    if (names.length > 0) {
      if (names.length !== priced.participantsCount) {
        throw new BookingDomainError('VALIDATION_ERROR', 'Informe o nome de cada pessoa.');
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

    const contactPhone = input.contactPhone?.trim() ?? '';
    const needsPhone = CHECK_IN_CODE_KINDS.includes(offer.kind);
    if (needsPhone && !E164.test(contactPhone)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Informe seu telefone com DDD.');
    }
    const keepsContacts = offer.pickupMode === 'buyer_address' || needsPhone;

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
        ...(offer.businessName ? { businessName: offer.businessName } : {}),
        sellingUnit: offer.sellingUnit ?? 'person',
        ...(offer.sellingUnit === 'group' && offer.groupMaxPeople
          ? { groupMaxPeople: offer.groupMaxPeople }
          : {}),
        ...(named ? { requiresParticipantNames: true } : {}),
        ...placeTimeOf(offer),
      },
      termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
      ...(offer.pickupMode === 'buyer_address' ? { pickupAddress } : {}),
      ...(needsPhone ? { contactPhone } : {}),
      ...(keepsContacts
        ? {
            personalDataEraseAt: new Date(
              serviceEndsAtMs(slot.startsAt, offer.durationMinutes) + CONTACT_RETENTION_MS
            ).toISOString(),
          }
        : {}),
      locale: input.locale,
      idempotencyKey: input.idempotencyKey,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const participants = names.map((name, index) => ({ name, isLeadContact: index === 0 }));
    // A mesma chave de idempotência devolve a reserva já criada, sem gastar outro uso do cupom.
    const existing = await this.port.getBooking(booking.id);
    if (existing) return existing;
    const promoId = promo && (priced.discountMinor ?? 0) > 0 ? promo.promo.id : null;
    return withBookingPromoUse({ promoId, buyerUid: actor.uid }, (use) =>
      this.port.reserveCapacityAndCreateBooking({ ...booking, ...use }, participants)
    );
  }
}
