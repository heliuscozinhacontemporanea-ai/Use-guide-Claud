import { useEffect, useState } from 'react';
import { listPublishedOffersForItemUseCase } from '../application/usecases/listPublishedOffersForItemUseCase';
import type { PublicOffer } from '../types/bookings';

export function usePublishedOffers(guideItemId: string) {
  const [data, setData] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPublishedOffersForItemUseCase(guideItemId)
      .then((offers) => {
        if (active) setData(offers);
      })
      .catch(() => {
        // Sem oferta legível (ou erro de rede) o painel simplesmente não aparece.
        if (active) setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [guideItemId]);

  return { data, loading };
}
