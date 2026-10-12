import { bookingsApi } from '../../factory';
import type { CreateBookingPayload, CreateBookingResponse } from '../../types/bookings';

/** Reserva as vagas por 15 min e devolve o segredo do Payment Element; o preço é do backend. */
export async function createBookingUseCase(
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> {
  return bookingsApi.createBooking(payload);
}
