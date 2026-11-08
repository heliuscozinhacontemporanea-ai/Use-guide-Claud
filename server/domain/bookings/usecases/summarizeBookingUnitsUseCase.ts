import { getBookingService } from '../factory';

/** Pessoas e grupos vendidos por reserva do vendedor (Relatórios, p23). */
export function summarizeBookingUnitsUseCase(
  sellerUid: string,
  bookingIds: string[]
): Promise<Record<string, { people: number; groups: number }>> {
  return getBookingService().summarizeUnits(sellerUid, bookingIds);
}
