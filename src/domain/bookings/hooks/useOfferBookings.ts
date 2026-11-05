import { useCallback, useEffect, useState } from 'react';
import { currentLocation } from '../adapters/browserLocation';
import { answerProviderAbsenceUseCase } from '../application/usecases/answerProviderAbsenceUseCase';
import { checkInWithoutCodeUseCase } from '../application/usecases/checkInWithoutCodeUseCase';
import { listOfferBookingsUseCase } from '../application/usecases/listOfferBookingsUseCase';
import { markNoShowUseCase } from '../application/usecases/markNoShowUseCase';
import { recordArrivalUseCase } from '../application/usecases/recordArrivalUseCase';
import type { BookingSummary, NoCodeReason } from '../types/bookings';
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

  const replace = useCallback((updated: BookingSummary) => {
    setData((current) =>
      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
  }, []);

  const markNoShow = useCallback(
    async (bookingId: string) => replace(await markNoShowUseCase(bookingId)),
    [replace]
  );

  /** Devolve se a localização foi registrada, para avisar quando não foi. */
  const recordArrival = useCallback(
    async (bookingId: string): Promise<boolean> => {
      const location = await currentLocation();
      replace(await recordArrivalUseCase(offerId, bookingId, location ?? undefined));
      return location !== null;
    },
    [offerId, replace]
  );

  const checkInWithoutCode = useCallback(
    async (bookingId: string, reason: NoCodeReason) =>
      replace(await checkInWithoutCodeUseCase(offerId, bookingId, { reason })),
    [offerId, replace]
  );

  const answerAbsence = useCallback(
    async (bookingId: string, answer: 'was_there' | 'admitted') =>
      replace(await answerProviderAbsenceUseCase(offerId, bookingId, answer)),
    [offerId, replace]
  );

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    replace,
    markNoShow,
    recordArrival,
    checkInWithoutCode,
    answerAbsence,
  };
}
