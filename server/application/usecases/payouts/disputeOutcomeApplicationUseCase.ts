import { type DisputeOutcome, getPaymentReferenceUseCase } from '../../../domain/payment';
import { hasCheckedInTicketForOrderUseCase } from '../../../domain/ticketing';

/**
 * Quem arca com a contestação encerrada (D14, D16). `warning_closed` é consulta sem estorno. Perdida:
 * com check-in do ingresso, a plataforma arca; reserva não tem check-in no app e vira dívida, que o
 * admin pode perdoar com prova apresentada fora do app.
 */
export async function disputeOutcomeApplicationUseCase(
  paymentIntentId: string,
  stripeStatus: string
): Promise<DisputeOutcome> {
  if (stripeStatus === 'won' || stripeStatus === 'warning_closed') return 'won';
  const reference = await getPaymentReferenceUseCase(paymentIntentId);
  if (reference?.referenceType === 'ticket_order') {
    return (await hasCheckedInTicketForOrderUseCase(reference.referenceId))
      ? 'lost_platform_absorbs'
      : 'lost_partner_pays';
  }
  return 'lost_partner_pays';
}
