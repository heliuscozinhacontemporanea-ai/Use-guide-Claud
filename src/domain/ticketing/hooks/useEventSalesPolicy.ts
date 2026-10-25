import { useEffect, useState } from 'react';
import { type EventSalesPolicy, getEventListingByIdUseCase } from '../../events';

/** Regras de venda do evento, exibidas antes da compra (AGENTS.md §8.7). */
export function useEventSalesPolicy(eventId: string | undefined) {
  const [salesPolicy, setSalesPolicy] = useState<EventSalesPolicy | null>(null);

  useEffect(() => {
    setSalesPolicy(null);
    if (!eventId) return;
    let active = true;
    getEventListingByIdUseCase(eventId)
      .then((listing) => {
        if (active) setSalesPolicy(listing?.salesPolicy ?? null);
      })
      .catch((error: unknown) => {
        // Sem a política, o aviso some e o resumo do pedido mostra a gravada na reserva.
        console.error('[useEventSalesPolicy]', error);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  return salesPolicy;
}
