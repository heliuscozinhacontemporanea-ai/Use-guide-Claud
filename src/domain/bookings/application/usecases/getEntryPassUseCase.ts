import { bookingsApi } from '../../factory';
import type { EntryPassView } from '../../types/bookings';

export async function getEntryPassUseCase(bookingId: string): Promise<EntryPassView> {
  return bookingsApi.getEntryPass(bookingId);
}
