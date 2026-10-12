import { useCallback, useEffect, useState } from 'react';
import { listOfferBookingsUseCase } from '../application/usecases/listOfferBookingsUseCase';
import { markNoShowUseCase } from '../application/usecases/markNoShowUseCase';
import type { BookingSummary } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function useOfferBookings(offerId: string) {
  const [data, setData] = useState<BookingSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listOfferBookingsUseCase(offerId, cursor);
        setData((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err: unknown) {
        setError(getBookingErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [offerId]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const markNoShow = useCallback(async (bookingId: string) => {
    const updated = await markNoShowUseCase(bookingId);
    setData((current) =>
      current.map((item) => (item.id === bookingId ? { ...item, ...updated } : item))
    );
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    markNoShow,
  };
}
