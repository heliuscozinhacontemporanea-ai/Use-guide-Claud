import { useCallback, useEffect, useState } from 'react';
import { listMyListingClaimsUseCase } from '../application/usecases/listMyListingClaimsUseCase';
import type { MyListingClaim } from '../types/listingClaim';

/** Pedidos de "Sou o dono" de quem está no painel (D35, telas 8 e 9). */
export function useMyListingClaims() {
  const [claims, setClaims] = useState<MyListingClaim[]>([]);
  const reload = useCallback(async () => {
    try {
      setClaims(await listMyListingClaimsUseCase());
    } catch {
      // Os cartões do pedido são um extra do Início: sem a lista, o resto do painel continua.
      setClaims([]);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { claims, reload };
}
