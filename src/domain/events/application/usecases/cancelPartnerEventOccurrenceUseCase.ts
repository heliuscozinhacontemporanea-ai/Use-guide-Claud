import { eventsAdapter } from '../../factory';

/** O backend reembolsa por inteiro os pedidos pagos e cobra a multa de 20% do CNPJ (D14). */
export async function cancelPartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  reason: string
): Promise<void> {
  return eventsAdapter.cancelPartnerEventOccurrence(eventListingId, occurrenceId, reason);
}
