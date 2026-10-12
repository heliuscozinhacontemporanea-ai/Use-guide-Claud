import { useCallback, useEffect, useState } from 'react';
import { createOfferUseCase } from '../application/usecases/createOfferUseCase';
import { listPartnerOffersUseCase } from '../application/usecases/listPartnerOffersUseCase';
import { setOfferStatusUseCase } from '../application/usecases/setOfferStatusUseCase';
import { updateOfferUseCase } from '../application/usecases/updateOfferUseCase';
import type { CreateOfferPayload, OfferFields, OfferStatus, PartnerOffer } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function usePartnerOffers() {
  const [data, setData] = useState<PartnerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPartnerOffersUseCase());
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replace = useCallback((offer: PartnerOffer) => {
    setData((current) => {
      const exists = current.some((item) => item.id === offer.id);
      return exists
        ? current.map((item) => (item.id === offer.id ? offer : item))
        : [...current, offer];
    });
    return offer;
  }, []);

  const create = useCallback(
    async (payload: CreateOfferPayload) => replace(await createOfferUseCase(payload)),
    [replace]
  );
  const update = useCallback(
    async (offerId: string, payload: Partial<OfferFields>) =>
      replace(await updateOfferUseCase(offerId, payload)),
    [replace]
  );
  const setStatus = useCallback(
    async (offerId: string, status: Exclude<OfferStatus, 'draft'>) =>
      replace(await setOfferStatusUseCase(offerId, status)),
    [replace]
  );

  return { data, loading, error, reload, create, update, setStatus };
}
