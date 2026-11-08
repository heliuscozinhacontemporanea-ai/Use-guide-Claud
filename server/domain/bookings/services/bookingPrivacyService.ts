import type { BookingsPort } from '../ports/bookingsPort';
import type { Booking } from '../types/bookingTypes';

const SYSTEM_ACTOR = 'system';
const BUYER_PAGE = 100;

function withoutContacts(booking: Booking): Booking | null {
  if (!booking.pickupAddress && !booking.contactPhone && !booking.personalDataEraseAt) return null;
  const {
    pickupAddress: _address,
    contactPhone: _phone,
    personalDataEraseAt: _eraseAt,
    ...rest
  } = booking;
  return rest;
}

/**
 * Dados pessoais das reservas (§7.5, D20, D27): endereço de busca e telefone saem 7 dias depois do
 * serviço, e a exclusão de conta tira endereço, telefone e nomes de participantes. A reserva fica, porque é registro financeiro.
 */
export class BookingPrivacyService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async eraseExpiredContacts(limit = 200): Promise<number> {
    const due = await this.port.listBookingsWithPersonalDataEraseBefore(
      this.now().toISOString(),
      limit
    );
    for (const booking of due) {
      await this.port.updateBooking(booking.id, withoutContacts, {
        actorUid: SYSTEM_ACTOR,
        reason: 'contacts_erased',
      });
    }
    return due.length;
  }

  async anonymizeBuyer(buyerUid: string): Promise<number> {
    let cursor: string | null = null;
    let anonymized = 0;
    do {
      const page = await this.port.listBookingsByBuyer(buyerUid, { limit: BUYER_PAGE, cursor });
      for (const booking of page.data) {
        await this.port.deleteParticipants(booking.id);
        await this.port.updateBooking(booking.id, withoutContacts, {
          actorUid: SYSTEM_ACTOR,
          reason: 'buyer_account_deleted',
        });
        anonymized += 1;
      }
      cursor = page.nextCursor;
    } while (cursor);
    return anonymized;
  }
}
