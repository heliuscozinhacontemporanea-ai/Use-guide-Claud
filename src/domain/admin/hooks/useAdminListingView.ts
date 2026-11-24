import { useEffect, useState } from 'react';
import { getAdminListingUseCase } from '../application/usecases/getAdminListingUseCase';
import type { AdminListingView } from '../types/adminListing';

/** Passos, publicação e dono do anúncio aberto pelo admin; relê quando `version` muda. */
export function useAdminListingView(itemId: string, version: number) {
  const [view, setView] = useState<AdminListingView | null>(null);
  const [failed, setFailed] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `version` só dispara a releitura
  useEffect(() => {
    let active = true;
    setFailed(false);
    getAdminListingUseCase(itemId)
      .then((next) => {
        if (active) setView(next);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [itemId, version]);

  return { view, failed };
}
