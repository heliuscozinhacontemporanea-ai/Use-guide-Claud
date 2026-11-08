import { bookingsApi } from '../../factory';

export async function setParticipantNameUseCase(
  bookingId: string,
  unit: number,
  name: string
): Promise<{ unit: number; name: string; changed: boolean }> {
  return bookingsApi.setParticipantName(bookingId, unit, name);
}
