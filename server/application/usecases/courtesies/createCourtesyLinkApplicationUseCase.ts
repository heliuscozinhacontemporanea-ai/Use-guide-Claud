import { createCourtesyLinkUseCase, type TicketingActorContext } from '../../../domain/ticketing';
import { assertActorPartnerTerms } from '../partnerTermsGate';

/** Link de convite (D27), só com os termos atuais do parceiro aceitos (etapa 5). */
export async function createCourtesyLinkApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ courtesyId: string; token: string; expiresAt: string }> {
  await assertActorPartnerTerms(actor);
  return createCourtesyLinkUseCase(actor, occurrenceId);
}
