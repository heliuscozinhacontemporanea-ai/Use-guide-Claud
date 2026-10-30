import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { BookingActor, BookingParticipant } from '../types/bookingTypes';
import { checkInsOf } from '../utils/serviceProof';

// A troca do nome fecha 24 h antes do início, como nas plataformas de ingresso nominal (D20).
const NAME_CHANGE_CLOSES_BEFORE_MS = 24 * 60 * 60 * 1000;

/** Nome de cada pessoa na entrada nominal (D20): informar uma vez e trocar no máximo uma vez. */
export class BookingParticipantService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async setName(
    actor: BookingActor,
    bookingId: string,
    unit: number,
    rawName: string
  ): Promise<BookingParticipant> {
    const booking = await this.port.getBooking(bookingId);
    // Só o cliente informa os nomes; reserva de outra pessoa responde como inexistente (§7.10).
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    const name = rawName.trim();
    if (
      !booking.offerSnapshot.requiresParticipantNames ||
      booking.status !== 'confirmed' ||
      !Number.isInteger(unit) ||
      unit < 0 ||
      unit >= booking.participantsCount ||
      checkInsOf(booking).some((checkIn) => checkIn.unit === unit) ||
      name.length < 2 ||
      name.length > 80
    ) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Não é possível informar este nome.');
    }
    const nowDate = this.now();
    const changeClosed =
      nowDate.getTime() >
      new Date(booking.offerSnapshot.startsAt).getTime() - NAME_CHANGE_CLOSES_BEFORE_MS;
    return this.port.setParticipant(booking.id, unit, (current) => {
      if (!current?.name) return { name, isLeadContact: unit === 0 };
      if (current.name === name) return current;
      if (current.nameChangedAt || changeClosed) {
        throw new BookingDomainError(
          'NAME_CHANGE_NOT_ALLOWED',
          'O nome só pode ser trocado uma vez, até 24 h antes.'
        );
      }
      return { ...current, name, nameChangedAt: nowDate.toISOString() };
    });
  }
}
