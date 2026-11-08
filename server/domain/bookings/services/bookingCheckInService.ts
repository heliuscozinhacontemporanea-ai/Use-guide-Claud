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
  CHECK_IN_OPENS_BEFORE_MS,
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
  /** O nome só pode ser trocado uma vez (D20). */
  nameChanged: boolean;
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

/** Código digitado no cartão "Inserir código" do estabelecimento (D27): sem escolher o horário. */
export interface EstablishmentCheckInInput {
  guideItemId: string;
  code: string;
  capturedAt?: string;
}

/** Resultado do código do estabelecimento: a unidade e o progresso do horário em que caiu. */
export interface EstablishmentCheckInResult extends UnitCheckInResult {
  offer: { id: string; title: string; kind: string };
  slot: { id: string; startsAt: string };
  /** Unidades com check-in no horário, depois deste, e o total vendido. */
  delivered: { checkedIn: number; total: number };
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

// Teto de erros do "Inserir código" do estabelecimento a cada 15 min (D27).
const ESTABLISHMENT_MAX_FAILURES = 20;
// Horários que começaram até 36 h atrás ainda podem estar abertos (12 h depois do fim, D20).
const ESTABLISHMENT_LOOKBACK_MS = 36 * 60 * 60_000;

/** Os erros do código do estabelecimento ficam numa chave própria, separada dos horários. */
export function establishmentFailureScope(guideItemId: string): string {
  return `guide_item:${guideItemId}`;
}

function isActive(booking: Booking): boolean {
  return (
    (booking.status === 'confirmed' || booking.status === 'completed') &&
    // Já reembolsada porque o parceiro não veio (D20): os códigos não valem mais.
    booking.providerAbsence?.resolution !== 'refunded'
  );
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
    const { startsAt, durationMinutes, timeZone } = booking.offerSnapshot;
    const visibleFromMs = checkInCodeVisibleFromMs(startsAt, timeZone);
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
        nameChanged: Boolean(participants[unit]?.nameChangedAt),
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

    const match = await this.findCode([slot.id], input.code);
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    return this.record(actor, match, atMs, nowDate, input.capturedAt);
  }

  /**
   * "Inserir código" do estabelecimento (D27): o código é procurado em todos os horários com
   * check-in aberto das ofertas do dono naquele item, em qualquer ordem. Erros contam por
   * estabelecimento: 5 por horário aberto, com teto de 20 a cada 15 min.
   */
  async checkInByEstablishmentCode(
    actor: BookingActor,
    input: EstablishmentCheckInInput
  ): Promise<EstablishmentCheckInResult> {
    const offers = (await this.port.listOffersByOwner(actor.uid)).filter(
      (offer) => offer.guideItemId === input.guideItemId && CHECK_IN_CODE_KINDS.includes(offer.kind)
    );
    // Item de outro dono, ou sem ofertas com código, responde como inexistente (§7.10).
    if (offers.length === 0) {
      throw new BookingDomainError('NOT_FOUND', 'Estabelecimento não encontrado.');
    }
    const nowDate = this.now();
    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
    if (atMs === null) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora do check-in inválida.');
    }
    const open = (
      await Promise.all(
        offers.map(async (offer) =>
          (
            await this.port.listSlots(
              offer.id,
              new Date(atMs - ESTABLISHMENT_LOOKBACK_MS).toISOString(),
              new Date(atMs + CHECK_IN_OPENS_BEFORE_MS + 1).toISOString()
            )
          )
            .filter((slot) => slot.status === 'open')
            .filter((slot) => {
              const { opensAtMs, closesAtMs } = checkInWindow(slot.startsAt, offer.durationMinutes);
              return atMs >= opensAtMs && atMs <= closesAtMs;
            })
            .map((slot) => ({ offer, slot }))
        )
      )
    ).flat();
    if (open.length === 0) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'Nenhum horário com check-in aberto agora.'
      );
    }

    const scope = establishmentFailureScope(input.guideItemId);
    const since = new Date(nowDate.getTime() - CHECK_IN_FAILURE_WINDOW_MS).toISOString();
    const limit = Math.min(CHECK_IN_MAX_FAILURES * open.length, ESTABLISHMENT_MAX_FAILURES);
    if ((await this.port.countCheckInFailures(scope, since)) >= limit) {
      throw new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      );
    }
    const match = await this.findCode(
      open.map((entry) => entry.slot.id),
      input.code
    );
    if (!match) {
      await this.port.addCheckInFailure(scope, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    const result = await this.record(actor, match, atMs, nowDate, input.capturedAt);
    const { offer, slot } = open.find((entry) => entry.slot.id === result.booking.slotId)!;
    const bookings = (await this.port.listBookingsBySlot(slot.id)).filter(isActive);
    return {
      ...result,
      offer: { id: offer.id, title: offer.title['pt-BR'], kind: offer.kind },
      slot: { id: slot.id, startsAt: slot.startsAt },
      delivered: {
        checkedIn: bookings.reduce((sum, booking) => sum + checkInsOf(booking).length, 0),
        total: bookings.reduce((sum, booking) => sum + booking.participantsCount, 0),
      },
    };
  }

  private async findCode(
    slotIds: string[],
    raw: string
  ): Promise<{ booking: Booking; unit: number } | null> {
    const code = normalizeCheckInCode(raw);
    if (!code) return null;
    for (const slotId of slotIds) {
      for (const booking of await this.port.listBookingsBySlot(slotId)) {
        const unit = isActive(booking)
          ? matchCheckInCodeUnit(booking.id, booking.participantsCount, code)
          : null;
        if (unit !== null) return { booking, unit };
      }
    }
    return null;
  }

  private async record(
    actor: BookingActor,
    match: { booking: Booking; unit: number },
    atMs: number,
    nowDate: Date,
    capturedAt: string | undefined
  ): Promise<UnitCheckInResult> {
    const checkIn: BookingCheckIn = {
      unit: match.unit,
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: 'code',
      ...(capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
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
