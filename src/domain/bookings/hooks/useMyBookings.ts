import { useCallback, useEffect, useState } from 'react';
import { cancelBookingUseCase } from '../application/usecases/cancelBookingUseCase';
import { listMyBookingsUseCase } from '../application/usecases/listMyBookingsUseCase';
import type { BookingSummary, CancelBookingResponse } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function useMyBookings() {
  const [data, setData] = useState<BookingSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cursor: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const page = await listMyBookingsUseCase(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  const cancel = useCallback(async (bookingId: string): Promise<CancelBookingResponse> => {
    const result = await cancelBookingUseCase(bookingId);
    setData((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status: result.status } : booking
      )
    );
    return result;
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    cancel,
  };
}
