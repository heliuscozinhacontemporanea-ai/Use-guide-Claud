import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { listMySaleClaimsUseCase } from '../../application/usecases/listMySaleClaimsUseCase';
import { MySaleClaimsContext } from '../../hooks/mySaleClaimsContext';
import type { BuyerSaleClaim } from '../../types/saleClaims';

/** Busca as reclamações do comprador uma vez para todos os cartões da lista. */
export function MySaleClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<BuyerSaleClaim[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    listMySaleClaimsUseCase()
      // Sem a lista o botão continua disponível; o backend recusa a duplicada com CLAIM_ALREADY_EXISTS.
      .then((list) => active && setClaims(list))
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(
    (claim: BuyerSaleClaim) =>
      setClaims((current) => [claim, ...current.filter((entry) => entry.id !== claim.id)]),
    []
  );
  const value = useMemo(() => ({ claims, loaded, add }), [claims, loaded, add]);
  return <MySaleClaimsContext.Provider value={value}>{children}</MySaleClaimsContext.Provider>;
}
