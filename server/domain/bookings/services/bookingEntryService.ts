import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { EntryPassSignerPort } from '../ports/entryPassSignerPort';
import type {
  AvailabilitySlot,
  Booking,
  BookingActor,
  BookingCheckIn,
} from '../types/bookingTypes';
import {
  deriveCheckInCode,
  ENTRY_CODE_LENGTH,
  matchCheckInCodeUnit,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  checkInCodeVisibleFromMs,
  ENTRY_MAX_FAILURES_PER_ACTOR,
  ENTRY_MAX_FAILURES_PER_SLOT,
  entryWindow,
  resolveCheckInTime,
} from '../utils/checkInWindow';
import { checkInsOf } from '../utils/serviceProof';
import type { UnitCheckInResult } from './bookingCheckInService';

const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
const NOT_ENTRY = () =>
  new BookingDomainError('CHECK_IN_NOT_APPLICABLE', 'Esta reserva não é entrada de atração.');

/** Entrada de uma pessoa: QR assinado e código de 8 caracteres. */
export interface EntryPass {
  unit: number;
  /** null fora do dia da entrada ou depois que esta pessoa entrou. */
  qrToken: string | null;
  code: string | null;
  /** Nome da pessoa na entrada nominal (D20). */
  name: string | null;
  /** O nome só pode ser trocado uma vez (D20). */
  nameChanged: boolean;
  checkedInAt: string | null;
}

export interface EntryPassView {
  passes: EntryPass[];
  visibleFrom: string;
  validUntil: string;
}

export interface EntryCheckInInput {
  offerId: string;
  slotId: string;
  /** Um dos dois: o QR lido ou o código digitado. */
  qrToken?: string;
  code?: string;
  /** Hora do aparelho quando a entrada foi validada sem internet. */
  capturedAt?: string;
}

/**
 * Equipe da portaria da atração (C1): diz se a pessoa pode liberar entradas do lugar. Com `atIso`
 * (entrada lida sem internet e enviada depois), vale se ela fazia parte da equipe naquele instante.
 */
export type EntryGateStaffCheck = (
  guideItemId: string,
  uid: string,
  atIso?: string
) => Promise<boolean>;

/** Entrada de atração privada (D20): um QR assinado por pessoa, verificável sem internet. */
export class BookingEntryService {
  constructor(
    private readonly port: BookingsPort,
    private readonly signer: EntryPassSignerPort,
    private readonly now: () => Date = () => new Date(),
    private readonly isGateStaff: EntryGateStaffCheck = async () => false
  ) {}

  async getEntryPass(actor: BookingActor, bookingId: string): Promise<EntryPassView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o cliente vê as entradas; para os demais elas respondem como inexistentes (§7.10).
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    if (booking.kind !== 'private_entry') throw NOT_ENTRY();
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não tem entrada ativa.');
    }
    const slot = await this.port.getSlot(booking.slotId);
    if (!slot) throw NOT_FOUND();
    const { durationMinutes, timeZone } = booking.offerSnapshot;
    const { closesAtMs } = entryWindow(slot, durationMinutes, timeZone);
    const visibleFromMs = checkInCodeVisibleFromMs(slot.startsAt, timeZone);
    const nowMs = this.now().getTime();
    const open = nowMs >= visibleFromMs && nowMs <= closesAtMs;
    const participants = await this.port.getParticipants(booking.id);
    const used = new Map(checkInsOf(booking).map((checkIn) => [checkIn.unit, checkIn.at]));
    return {
      passes: Array.from({ length: booking.participantsCount }, (_, unit) => {
        const name = participants[unit]?.name || null;
        const visible = open && !used.has(unit);
        return {
          unit,
          qrToken: visible ? this.sign(booking, slot, unit, name, closesAtMs) : null,
          code: visible ? deriveCheckInCode(booking.id, ENTRY_CODE_LENGTH, unit) : null,
          name,
          nameChanged: Boolean(participants[unit]?.nameChangedAt),
          checkedInAt: used.get(unit) ?? null,
        };
      }),
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
    };
  }

  /**
   * Horários de entrada do lugar para quem opera a portaria (C1): o dono ou a equipe ativa. Só o
   * que a portaria precisa para abrir: oferta, horário e nome; sem vendas nem valores.
   */
  async listGateSlots(
    actor: BookingActor,
    guideItemId: string,
    fromIso: string,
    toIso: string
  ): Promise<
    Array<{
      offerId: string;
      slotId: string;
      title: string;
      startsAt: string;
      endsAt: string | null;
      timeZone: string | null;
    }>
  > {
    const offers = (await this.port.listPublishedOffersByGuideItem(guideItemId)).filter(
      (offer) => offer.kind === 'private_entry'
    );
    const owner = offers[0]?.ownerId;
    if (!owner || (owner !== actor.uid && !(await this.isGateStaff(guideItemId, actor.uid)))) {
      throw new BookingDomainError('NOT_FOUND', 'Lugar não encontrado.');
    }
    const lists = await Promise.all(
      offers.map(async (offer) =>
        (await this.port.listSlots(offer.id, fromIso, toIso))
          .filter((slot) => slot.status === 'open')
          .map((slot) => ({
            offerId: offer.id,
            slotId: slot.id,
            title: offer.title['pt-BR'],
            startsAt: slot.startsAt,
            endsAt: slot.endsAt ?? null,
            timeZone: offer.timeZone ?? null,
          }))
      )
    );
    return lists.flat().sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  /** Chaves públicas para a portaria conferir o QR sem internet; para o dono ou a equipe (C1). */
  async getVerificationKeys(
    actor: BookingActor,
    offerId: string
  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
    await this.ownedEntryOffer(actor, offerId);
    return this.signer.publicKeys();
  }

  async checkIn(actor: BookingActor, input: EntryCheckInInput): Promise<UnitCheckInResult> {
    const offer = await this.ownedEntryOffer(actor, input.offerId, input.capturedAt);
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    const nowDate = this.now();
    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
    if (atMs === null) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora da entrada inválida.');
    }
    const { opensAtMs, closesAtMs } = entryWindow(slot, offer.durationMinutes, offer.timeZone);
    if (atMs < opensAtMs || atMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'A entrada deste horário não vale agora.'
      );
    }
    const { booking, unit } = input.qrToken
      ? await this.unitFromQr(input.qrToken, slot)
      : await this.unitFromCode(actor, slot, input.code ?? '', nowDate);
    const before = checkInsOf(booking).find((item) => item.unit === unit);
    const checkIn: BookingCheckIn = {
      unit,
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: input.qrToken ? 'qr' : 'code',
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    // A mesma pessoa não entra duas vezes: o segundo uso volta como `alreadyCheckedIn`.
    const saved = before ? booking : await this.port.recordCheckIns(booking.id, [checkIn]);
    const participants = await this.port.getParticipants(booking.id);
    return {
      booking: saved,
      unit,
      name: participants[unit]?.name || null,
      alreadyCheckedIn: Boolean(before),
      checkedInAt: before?.at ?? checkIn.at,
    };
  }

  private sign(
    booking: Booking,
    slot: AvailabilitySlot,
    unit: number,
    name: string | null,
    closesAtMs: number
  ): string {
    return this.signer.sign({
      v: 1,
      bid: booking.id,
      sid: slot.id,
      oid: booking.offerId,
      u: unit,
      ...(name ? { nm: name } : {}),
      exp: Math.floor(closesAtMs / 1000),
    });
  }

  private async unitFromQr(
    token: string,
    slot: AvailabilitySlot
  ): Promise<{ booking: Booking; unit: number }> {
    const payload = this.signer.verify(token);
    if (!payload || payload.sid !== slot.id || payload.oid !== slot.offerId) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'QR Code inválido para este horário.');
    }
    const booking = await this.port.getBooking(payload.bid);
    if (!booking || !isActiveEntry(booking) || payload.u >= booking.participantsCount) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'Esta entrada não vale mais.');
    }
    return { booking, unit: payload.u };
  }

  private async unitFromCode(
    actor: BookingActor,
    slot: AvailabilitySlot,
    rawCode: string,
    nowDate: Date
  ): Promise<{ booking: Booking; unit: number }> {
    const since = new Date(nowDate.getTime() - CHECK_IN_FAILURE_WINDOW_MS).toISOString();
    const [byActor, bySlot] = await Promise.all([
      this.port.countCheckInFailures(slot.id, since, actor.uid),
      this.port.countCheckInFailures(slot.id, since),
    ]);
    if (byActor >= ENTRY_MAX_FAILURES_PER_ACTOR || bySlot >= ENTRY_MAX_FAILURES_PER_SLOT) {
      throw new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      );
    }
    const code = normalizeCheckInCode(rawCode, ENTRY_CODE_LENGTH);
    if (code) {
      for (const booking of (await this.port.listBookingsBySlot(slot.id)).filter(isActiveEntry)) {
        const unit = matchCheckInCodeUnit(
          booking.id,
          booking.participantsCount,
          code,
          ENTRY_CODE_LENGTH
        );
        if (unit !== null) return { booking, unit };
      }
    }
    await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
    throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
  }

  private async ownedEntryOffer(actor: BookingActor, offerId: string, capturedAt?: string) {
    const offer = await this.port.getOffer(offerId);
    // Só o dono ou a equipe da portaria do lugar (C1) valida a entrada, conferido a cada leitura;
    // de qualquer outra conta a oferta responde como inexistente (§7.10).
    const allowed =
      offer &&
      (offer.ownerId === actor.uid ||
        (offer.kind === 'private_entry' &&
          (await this.isGateStaff(offer.guideItemId, actor.uid, capturedAt))));
    if (!offer || !allowed) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    if (offer.kind !== 'private_entry') throw NOT_ENTRY();
    return offer;
  }
}

function isActiveEntry(booking: Booking): boolean {
  return (
    booking.kind === 'private_entry' &&
    (booking.status === 'confirmed' || booking.status === 'completed')
  );
}
