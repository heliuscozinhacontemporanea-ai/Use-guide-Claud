import { createContext, useContext } from 'react';
import type { BuyerSaleClaim } from '../types/saleClaims';

export interface MySaleClaimsState {
  claims: BuyerSaleClaim[];
  loaded: boolean;
  add: (claim: BuyerSaleClaim) => void;
}

export const MySaleClaimsContext = createContext<MySaleClaimsState | null>(null);

/** Reclamação já aberta para a venda, se houver; `undefined` enquanto a lista não chegou. */
export function useSaleClaimFor(
  referenceType: string,
  referenceId: string
): { claim: BuyerSaleClaim | null | undefined; add: (claim: BuyerSaleClaim) => void } {
  const state = useContext(MySaleClaimsContext);
  if (!state) throw new Error('useSaleClaimFor precisa de MySaleClaimsProvider.');
  const claim = state.loaded
    ? (state.claims.find(
        (entry) => entry.referenceType === referenceType && entry.referenceId === referenceId
      ) ?? null)
    : undefined;
  return { claim, add: state.add };
}
