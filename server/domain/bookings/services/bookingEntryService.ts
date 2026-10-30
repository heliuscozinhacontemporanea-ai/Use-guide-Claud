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
  checkInCodesMatch,
  deriveCheckInCode,
  ENTRY_CODE_LENGTH,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  ENTRY_MAX_FAILURES_PER_ACTOR,
  ENTRY_MAX_FAILURES_PER_SLOT,
  checkInCodeVisibleFromMs,
  entryWindow,
  resolveCheckInTime,
} from '../utils/checkInWindow';

const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
const NOT_ENTRY = () =>
  new BookingDomainError('CHECK_IN_NOT_APPLICABLE', 'Esta reserva não é entrada de atração.');

export interface EntryPassView {
  /** QR assinado e código de 8 caracteres; null fora do dia da entrada ou depois do check-in. */
  qrToken: string | null;
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

export interface EntryCheckInInput {
  offerId: string;
  slotId: string;
  /** Um dos dois: o QR lido ou o código digitado. */
  qrToken?: string;
  code?: string;
  participantsPresent: number;
  /** Hora do aparelho quando a entrada foi validada sem internet. */
  capturedAt?: string;
}

/** Entrada de atração privada (D20): QR assinado, verificável sem internet, e código de 8 caracteres. */
export class BookingEntryService {
  constructor(
    private readonly port: BookingsPort,
    private readonly signer: EntryPassSignerPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getEntryPass(actor: BookingActor, bookingId: string): Promise<EntryPassView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o comprador vê a entrada; para os demais ela responde como inexistente (§7.10).
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    if (booking.kind !== 'private_entry') throw NOT_ENTRY();
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não tem entrada ativa.');
    }
    const slot = await this.port.getSlot(booking.slotId);
    if (!slot) throw NOT_FOUND();
    const { closesAtMs } = entryWindow(slot, booking.offerSnapshot.durationMinutes);
    const visibleFromMs = checkInCodeVisibleFromMs(slot.startsAt);
    const nowMs = this.now().getTime();
    const visible = nowMs >= visibleFromMs && nowMs <= closesAtMs && !booking.checkIn;
    return {
      qrToken: visible ? this.sign(booking, slot, closesAtMs) : null,
      code: visible ? deriveCheckInCode(booking.id, ENTRY_CODE_LENGTH) : null,
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
      checkedInAt: booking.checkIn?.at ?? null,
    };
  }

  /** Chaves públicas para a portaria conferir o QR sem internet; só para o dono da oferta. */
  async getVerificationKeys(
    actor: BookingActor,
    offerId: string
  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
    await this.ownedEntryOffer(actor, offerId);
    return this.signer.publicKeys();
  }

  async checkIn(actor: BookingActor, input: EntryCheckInInput): Promise<Booking> {
    const offer = await this.ownedEntryOffer(actor, input.offerId);
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    const nowDate = this.now();
    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
    if (atMs === null) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora da entrada inválida.');
    }
    const { opensAtMs, closesAtMs } = entryWindow(slot, offer.durationMinutes);
    if (atMs < opensAtMs || atMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'A entrada deste horário não vale agora.'
      );
    }
    const booking = input.qrToken
      ? await this.bookingFromQr(input.qrToken, slot)
      : await this.bookingFromCode(actor, slot, input.code ?? '', nowDate);
    if (input.participantsPresent > booking.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }
    const checkIn: BookingCheckIn = {
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: input.qrToken ? 'qr' : 'code',
      participantsPresent: input.participantsPresent,
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    // Repetir a entrada devolve o check-in já gravado: a pessoa não entra duas vezes.
    return this.port.recordCheckIn(booking.id, checkIn);
  }

  private sign(booking: Booking, slot: AvailabilitySlot, closesAtMs: number): string {
    return this.signer.sign({
      v: 1,
      bid: booking.id,
      sid: slot.id,
      oid: booking.offerId,
      n: booking.participantsCount,
      exp: Math.floor(closesAtMs / 1000),
    });
  }

  private async bookingFromQr(token: string, slot: AvailabilitySlot): Promise<Booking> {
    const payload = this.signer.verify(token);
    if (!payload || payload.sid !== slot.id || payload.oid !== slot.offerId) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'QR Code inválido para este horário.');
    }
    const booking = await this.port.getBooking(payload.bid);
    if (!booking || !isActiveEntry(booking)) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'Esta entrada não vale mais.');
    }
    return booking;
  }

  private async bookingFromCode(
    actor: BookingActor,
    slot: AvailabilitySlot,
    rawCode: string,
    nowDate: Date
  ): Promise<Booking> {
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
    const match = code
      ? (await this.port.listBookingsBySlot(slot.id))
          .filter(isActiveEntry)
          .find((booking) =>
            listAcceptedCheckInCodes(booking.id, ENTRY_CODE_LENGTH).some((accepted) =>
              checkInCodesMatch(accepted, code)
            )
          )
      : undefined;
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    return match;
  }

  private async ownedEntryOffer(actor: BookingActor, offerId: string) {
    const offer = await this.port.getOffer(offerId);
    // Só o dono da oferta valida a entrada; de outro parceiro responde como inexistente (§7.10).
    if (!offer || offer.ownerId !== actor.uid) {
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
