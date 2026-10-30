import {
  type Booking,
  type BookingActor,
  type CheckInWithoutCodeInput,
  checkInWithoutCodeUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/** "Cliente sem código" e a pergunta "O serviço aconteceu?" ao comprador (D20). */
export async function checkInWithoutCodeApplicationUseCase(
  actor: BookingActor,
  input: CheckInWithoutCodeInput
): Promise<Booking> {
  const booking = await checkInWithoutCodeUseCase(actor, input);
  await sendBookingServiceNotice(booking.buyerId, 'confirmationAsked');
  return booking;
}
