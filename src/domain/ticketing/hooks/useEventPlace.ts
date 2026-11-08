import { useEffect, useState } from 'react';
import type { PlaceTime } from '../../../shared/utils/placeTime';
import { getEventListingByIdUseCase } from '../../events';

/** Fuso e cidade do evento (D28), para telas que só recebem o ID do evento. */
export function useEventPlace(eventListingId: string): PlaceTime | undefined {
  const [place, setPlace] = useState<PlaceTime | undefined>(undefined);
  useEffect(() => {
    let active = true;
    getEventListingByIdUseCase(eventListingId)
      .then((listing) => {
        if (active && listing) setPlace({ timeZone: listing.timeZone, city: listing.city });
      })
      // Sem o evento, a tela segue no fuso da plataforma; a sessão continua utilizável.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [eventListingId]);
  return place;
}
